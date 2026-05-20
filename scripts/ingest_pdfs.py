#!/usr/bin/env python3
"""
Ingesta PDFs locales a PostgreSQL.

Uso:
  python3 scripts/ingest_pdfs.py /ruta/a/carpeta/       # todos los PDFs de la carpeta
  python3 scripts/ingest_pdfs.py /ruta/a/archivo.pdf    # un solo PDF
  python3 scripts/ingest_pdfs.py /ruta/ --db postgresql://fabianortega@localhost:5432/epicrisis_test

Por defecto conecta a: postgresql://fabianortega@localhost:5432/epicrisis_dev

El script es idempotente: si el PDF ya fue ingestado (mismo patient_id), lo saltea.
"""

import argparse
import hashlib
import hmac
import os
import re
import sys
from pathlib import Path

import psycopg2
import pdfplumber

# ── Configuración ──────────────────────────────────────────────────────────────

SCRIPT_DIR   = Path(__file__).parent
SALT_FILE    = SCRIPT_DIR / '.pdf_salt'
HMAC_PASSWORD = b'epicrisis-ihealth-2026'
DEFAULT_DB   = 'postgresql://fabianortega@localhost:5432/epicrisis_dev'

# ── Patient ID ─────────────────────────────────────────────────────────────────

def load_or_create_salt() -> bytes:
    if SALT_FILE.exists():
        return bytes.fromhex(SALT_FILE.read_text().strip())
    salt = os.urandom(32)
    SALT_FILE.write_text(salt.hex())
    print(f'✓ Nuevo salt guardado en {SALT_FILE}')
    return salt

def make_patient_id(stem: str, salt: bytes) -> str:
    key = HMAC_PASSWORD + salt
    h = hmac.new(key, stem.encode('utf-8'), hashlib.sha256)
    return h.hexdigest()[:16].upper()

# ── Anonimización ──────────────────────────────────────────────────────────────

RUT_RE = re.compile(r'\b\d{1,2}[\.\s]?\d{3}[\.\s]?\d{3}[-–]?[0-9kK]\b')

FIRMA_RE = re.compile(
    r'[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:[^\S\n]+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}){1,3}'
    r'\s*\n\s*\d{1,2}[-/]\d{1,2}[-/]\d{4}[^\n]*',
    re.MULTILINE,
)

SURGEON_RE = re.compile(
    r'(?<=\d{2}:\d{2})\s*-\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+\s*$',
    re.MULTILINE,
)

LONE_NAME_RE = re.compile(
    r'^\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})+\s*$',
    re.MULTILINE,
)

MEDICAL_RE = re.compile(
    r'(?:Resumen|Antecedentes|Diagnóstico|Evolución|Procedimientos?|'
    r'Anamnesis|Laboratorio|Ingreso|Egreso|Indicaciones?|Controles?|'
    r'Régimen|Alimentario|Medicamentos?|Reposo|Hospitalización|'
    r'Intervenciones?|Quirúrgicas?|Epidemiología|Comorbilidades?|'
    r'Paciente|Fallecido|Alta|Traslado|Urgencia|INTERNO|STAFF)',
    re.IGNORECASE,
)

def anonymize(text: str, stem: str) -> str:
    # Nombre del paciente (variantes del stem del archivo)
    variants = sorted({stem, stem.replace(' ', ''), stem.replace('-', ' ')}, key=len, reverse=True)
    for v in variants:
        if len(v) > 3:
            text = re.sub(re.escape(v), '[ANONIMIZADO]', text, flags=re.IGNORECASE)

    # RUT
    text = RUT_RE.sub('[RUT ANONIMIZADO]', text)

    # Etiquetas nombre/paciente
    for label in ['Nombre', 'Paciente', 'Nombre completo', 'Nombre del paciente']:
        text = re.sub(
            rf'(?i)({re.escape(label)}\s*[:：]\s*)([^\n]{{2,60}})',
            r'\1[ANONIMIZADO]',
            text,
        )

    # Firmas médicas (nombre + fecha)
    text = FIRMA_RE.sub('[FIRMA MÉDICO ANONIMIZADA]', text)
    text = SURGEON_RE.sub('', text)

    # Nombres solos en línea (que no sean términos médicos)
    def _remove_lone(m):
        line = m.group(0).strip()
        return m.group(0) if MEDICAL_RE.search(line) else ''
    text = LONE_NAME_RE.sub(_remove_lone, text)

    return re.sub(r'\n{3,}', '\n\n', text).strip()

# ── Extracción de texto ────────────────────────────────────────────────────────

def extract_text(pdf_path: Path) -> str:
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                pages.append(t.strip())
    return '\n\n'.join(pages)

# ── Extracción de secciones (igual que migrate_sections.py) ───────────────────

SECTION_DEFS = [
    ('resumen_clinico',    'Resumen Clínico',                 []),
    ('motivo_ingreso',     'Motivo o Diagnóstico de Ingreso', ['MOTIVO O DIAGNÓSTICO DE INGRESO', 'MOTIVO O DIAGNOSTICO DE INGRESO']),
    ('antecedentes',       'Antecedentes Médicos Detallados', ['ANTECEDENTES MÉDICOS DETALLADOS', 'ANTECEDENTES MEDICOS DETALLADOS']),
    ('comorbilidades',     'Comorbilidades',                  ['COMORBILIDADES']),
    ('procedimientos',     'Procedimientos',                  ['PROCEDIMIENTOS']),
    ('intervenciones',     'Intervenciones Quirúrgicas',      ['INTERVENCIONES QUIRÚRGICAS', 'INTERVENCIONES QUIRURGICAS']),
    ('epidemiologia',      'Epidemiología',                   ['EPIDEMIOLOGÍA', 'EPIDEMIOLOGIA']),
    ('diagnostico_egreso', 'Diagnóstico de Egreso',           ['DIAGNÓSTICO DE EGRESO', 'DIAGNOSTICO DE EGRESO']),
    # condicion_egreso se extrae via regex (campo inline de doble columna)
    ('plan_post_alta',     'Plan Post Alta',                  ['PLAN POST ALTA']),
    ('indicaciones',       'Indicaciones',                    ['INDICACIONES']),
    ('controles',          'Controles',                       ['CONTROLES']),
    ('tipo_reposo',        'Tipo de Reposo',                  ['TIPO DE REPOSO']),
    # egreso_cateter se extrae via regex (campo SI/NO en columna del PDF, no sección)
]

# Regex para campos inline de doble columna en el formulario
CATETER_RE = re.compile(
    r'Egreso\s+con\s+Cat[eé]ter\s+Doble\s+J\s*:\s*(SI|NO|S[ií])',
    re.IGNORECASE,
)
CONDICION_RE = re.compile(
    r'Condici[oó]n\s+de\s+Egreso\s+(.+?)\s+Egreso\s+con\s+Cat[eé]ter',
    re.IGNORECASE | re.DOTALL,
)

ALL_MARKERS     = [m for _, _, markers in SECTION_DEFS for m in markers]
MARKER_RE       = re.compile(r'^(' + '|'.join(re.escape(m) for m in ALL_MARKERS) + r')\s*$', re.MULTILINE | re.IGNORECASE)
MARKER_TO_NAME  = {m.upper(): name for name, _, markers in SECTION_DEFS for m in markers}
NAME_TO_POS     = {name: i + 1 for i, (name, _, _) in enumerate(SECTION_DEFS)}
NAME_TO_LABEL   = {name: label for name, label, _ in SECTION_DEFS}
NAME_TO_POS['egreso_cateter']    = 14
NAME_TO_LABEL['egreso_cateter']  = 'Egreso con Catéter Doble J'
NAME_TO_POS['condicion_egreso']  = 9
NAME_TO_LABEL['condicion_egreso'] = 'Condición de Egreso'

def is_meaningful(text: str) -> bool:
    return len(re.sub(r'[\[\]\(\)\-:.,\s\n]', '', text)) >= 8

def extract_sections(markdown: str) -> list[dict]:
    first = MARKER_RE.search(markdown)
    resumen = markdown[:first.start()].strip() if first else markdown.strip()

    result = {}
    if is_meaningful(resumen):
        result['resumen_clinico'] = re.sub(r'\n{3,}', '\n\n', resumen).strip()

    if first:
        splits = MARKER_RE.split(markdown[first.start():])
        i = 1
        while i < len(splits) - 1:
            marker = splits[i].strip().upper()
            content = splits[i + 1].strip() if i + 1 < len(splits) else ''
            name = MARKER_TO_NAME.get(marker)
            if name and is_meaningful(content) and name not in result:
                result[name] = re.sub(r'\n{3,}', '\n\n', content).strip()
            i += 2

    # Campos inline de doble columna en el formulario
    m = CATETER_RE.search(markdown)
    if m:
        valor = m.group(1).upper()
        result['egreso_cateter'] = 'Sí' if valor in ('SI', 'SÍ') else 'No'

    m = CONDICION_RE.search(markdown)
    if m:
        result['condicion_egreso'] = m.group(1).strip()

    return [
        {'name': name, 'label': NAME_TO_LABEL[name], 'content': content, 'position': NAME_TO_POS[name]}
        for name, content in result.items()
    ]

# ── Ingesta principal ──────────────────────────────────────────────────────────

def ingest_pdf(pdf_path: Path, salt: bytes, cur) -> str:
    stem       = pdf_path.stem
    patient_id = make_patient_id(stem, salt)

    # Verificar si ya existe
    cur.execute('SELECT id FROM epicrisis WHERE patient_id = %s', (patient_id,))
    if cur.fetchone():
        return f'  SKIP  {stem} (ya existe patient_id={patient_id})'

    # Extraer y anonimizar texto
    raw_text = extract_text(pdf_path)
    if not raw_text.strip():
        return f'  WARN  {stem} (PDF sin texto extraíble)'
    anon_text = anonymize(raw_text, stem)

    # Leer bytes del PDF
    pdf_bytes = pdf_path.read_bytes()

    # Insertar epicrisis
    cur.execute(
        """
        INSERT INTO epicrisis (patient_id, pdf_path, pdf_data, status)
        VALUES (%s, %s, %s, 'pending')
        RETURNING id
        """,
        (patient_id, pdf_path.name, psycopg2.Binary(pdf_bytes)),
    )
    epicrisis_id = cur.fetchone()[0]

    # Extraer e insertar secciones
    sections = extract_sections(anon_text)
    for s in sections:
        cur.execute(
            """
            INSERT INTO epicrisis_sections (epicrisis_id, section_name, label, content, position)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (epicrisis_id, section_name) DO NOTHING
            """,
            (epicrisis_id, s['name'], s['label'], s['content'], s['position']),
        )

    return f'  OK    {stem} → id={epicrisis_id}, patient_id={patient_id}, {len(sections)} secciones'

# ── CLI ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Ingestar PDFs a PostgreSQL')
    parser.add_argument('path', help='Carpeta con PDFs o archivo PDF individual')
    parser.add_argument('--db', default=DEFAULT_DB, help='Connection string PostgreSQL')
    parser.add_argument('--dry-run', action='store_true', help='Solo reporta, no inserta')
    args = parser.parse_args()

    target = Path(args.path)
    if target.is_dir():
        pdfs = sorted(target.glob('*.pdf'))
    elif target.is_file() and target.suffix.lower() == '.pdf':
        pdfs = [target]
    else:
        print(f'Error: {target} no es un PDF ni una carpeta válida')
        sys.exit(1)

    if not pdfs:
        print('No se encontraron PDFs.')
        sys.exit(0)

    print(f'{len(pdfs)} PDF(s) encontrado(s) en {target}')
    if args.dry_run:
        print('(modo dry-run: no se insertará nada)\n')

    salt = load_or_create_salt()
    conn = psycopg2.connect(args.db)
    cur  = conn.cursor()

    ok = skip = warn = 0
    for pdf_path in pdfs:
        if args.dry_run:
            stem = pdf_path.stem
            pid  = make_patient_id(stem, salt)
            print(f'  DRY   {stem} → patient_id={pid}')
            continue
        try:
            msg = ingest_pdf(pdf_path, salt, cur)
            conn.commit()
            print(msg)
            if 'OK' in msg:   ok   += 1
            elif 'SKIP' in msg: skip += 1
            else:               warn += 1
        except Exception as e:
            conn.rollback()
            print(f'  ERR   {pdf_path.name}: {e}')
            warn += 1

    cur.close()
    conn.close()

    if not args.dry_run:
        print(f'\n✓ Listo — OK: {ok}  SKIP: {skip}  WARN/ERR: {warn}')

if __name__ == '__main__':
    main()
