"""
Enriquece contentMarkdown con TODOS los campos estructurados del pipeline SQLite.
Aplica anonimización a los campos que aún contienen PII (nombres de médicos/cirujanos).

Uso:
  python3 scripts/enrich_contentmarkdown.py --dry-run   # solo reporta
  python3 scripts/enrich_contentmarkdown.py              # actualiza seed_data.json
"""
import sqlite3, json, re, sys
from pathlib import Path

DRY_RUN = '--dry-run' in sys.argv

SQLITE_PATH = Path('/home/fabian/src/proyecto_sotero_ihealth/pipeline/output/sotero_pacientes.db')
JSON_PATH   = Path(__file__).parent / 'seed_data.json'

# ── Anonymization patterns ─────────────────────────────────────────────────────

# "Nombre Apellido\n\nDD-MM-YYYY HH:MM:SS" (doctor signature)
FIRMA_RE = re.compile(
    r'[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:[^\S\n]+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}){1,3}'
    r'\s*\n\s*\d{1,2}[-/]\d{1,2}[-/]\d{4}[^\n]*',
    re.MULTILINE,
)

# Surgeon name at end of procedure line: "- 28/09/2023 00:00 - Francisco Figueroa Berrios"
SURGEON_RE = re.compile(
    r'(?<=\d{2}:\d{2})\s*-\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+\s*$',
    re.MULTILINE,
)

# Lone proper-name lines (≥2 capitalized words, no other content) left after FIRMA_RE
LONE_NAME_RE = re.compile(
    r'^\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,})+\s*$',
    re.MULTILINE,
)

# Medical terms that should NOT be treated as names
MEDICAL = re.compile(
    r'(?:Resumen|Antecedentes|Diagnóstico|Evolución|Procedimientos?|'
    r'Anamnesis|Laboratorio|Ingreso|Egreso|Indicaciones?|Controles?|'
    r'Régimen|Alimentario|Medicamentos?|Reposo|Hospitalización|'
    r'Intervenciones?|Quirúrgicas?|Epidemiología|Comorbilidades?|'
    r'Paciente|Fallecido|Alta|Traslado|Urgencia|INTERNO|STAFF)',
    re.IGNORECASE,
)

def anonymize(text: str) -> str:
    """Apply all anonymization passes to a field value."""
    text = FIRMA_RE.sub('', text)          # remove signature entirely
    text = SURGEON_RE.sub('', text)
    # Remove lone proper-name lines that survived (e.g. names not followed by date)
    def _remove_lone(m):
        line = m.group(0).strip()
        if MEDICAL.search(line):
            return m.group(0)
        return ''
    text = LONE_NAME_RE.sub(_remove_lone, text)
    # Collapse triple+ blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def meaningful(text: str) -> bool:
    """True if the field has substantive content (not just empty form scaffolding)."""
    stripped = re.sub(r'[\[\]\(\)\-:.,\s]', '', text)
    return len(stripped) >= 8


# Section headers as they appear in the epicrisis (used for idempotency check)
SECTION_MARKERS = [
    'ANTECEDENTES MÉDICOS DETALLADOS',
    'MOTIVO O DIAGNÓSTICO DE INGRESO',
    'COMORBILIDADES',
    'PROCEDIMIENTOS',
    'INTERVENCIONES QUIRÚRGICAS',
    'EPIDEMIOLOGÍA',
    'DIAGNÓSTICO DE EGRESO',
    'CONDICIÓN DE EGRESO',
    'PLAN POST ALTA',
    'INDICACIONES',
    'CONTROLES',
    'TIPO DE REPOSO',
    'EGRESO CON CATÉTER DOBLE J',
]

# Ordered sections to append (sqlite_field, section_header)
SECTIONS = [
    ('Antecedentes Médicos Detallados',  'ANTECEDENTES MÉDICOS DETALLADOS'),
    ('Motivo o Diagnóstico de Ingreso',  'MOTIVO O DIAGNÓSTICO DE INGRESO'),
    ('Comorbilidades',                   'COMORBILIDADES'),
    ('Procedimientos',                   'PROCEDIMIENTOS'),
    ('Intervenciones Quirúrgicas',       'INTERVENCIONES QUIRÚRGICAS'),
    ('Epidemiologia',                    'EPIDEMIOLOGÍA'),
    ('Diagnóstico de Egreso',            'DIAGNÓSTICO DE EGRESO'),
    ('Condición de Egreso',              'CONDICIÓN DE EGRESO'),
    ('Plan Post Alta',                   'PLAN POST ALTA'),
    ('Indicaciones',                     'INDICACIONES'),
    ('Controles',                        'CONTROLES'),
    ('Tipo de Reposo',                   'TIPO DE REPOSO'),
    ('Egreso con Catéter Doble J',       'EGRESO CON CATÉTER DOBLE J'),
]


def strip_previously_added(md: str) -> str:
    """Remove sections appended by a prior run so we can re-add them cleanly."""
    for marker in SECTION_MARKERS:
        # Find the section at the boundary where it was appended
        pattern = r'\n\n' + re.escape(marker) + r'\n'
        idx = md.find('\n\n' + marker + '\n')
        if idx >= 0:
            md = md[:idx]
    return md.rstrip()


# ── Load data ──────────────────────────────────────────────────────────────────

with open(JSON_PATH, encoding='utf-8') as f:
    seed_data = json.load(f)

conn = sqlite3.connect(SQLITE_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute('SELECT * FROM epicrisis_anonimizadas')
sqlite_rows = {r['ID Paciente Anónimo']: dict(r) for r in cur.fetchall()}
conn.close()

# ── Enrich ─────────────────────────────────────────────────────────────────────

updated = 0
skipped = 0
total_sections_added = 0

for record in seed_data:
    pid = record.get('patientId')
    sq  = sqlite_rows.get(pid)
    if not sq:
        skipped += 1
        continue

    base_md = strip_previously_added(record.get('contentMarkdown', ''))

    parts = []
    for sqlite_field, header in SECTIONS:
        raw = (sq.get(sqlite_field) or '').strip()
        if not raw:
            continue
        cleaned = anonymize(raw)
        if not meaningful(cleaned):
            continue
        parts.append(f'{header}\n{cleaned}')

    if not parts:
        skipped += 1
        continue

    new_md = base_md + '\n\n' + '\n\n'.join(parts)

    if DRY_RUN:
        if updated < 3:
            print(f'[{pid}] appending {len(parts)} sections:')
            for p in parts:
                first_line = p.split('\n')[0]
                print(f'  + {first_line}')
            print()
    else:
        record['contentMarkdown'] = new_md

    updated += 1
    total_sections_added += len(parts)

avg = total_sections_added / max(updated, 1)
print(f'{"[DRY RUN] " if DRY_RUN else ""}Registros actualizados: {updated} '
      f'| Secciones totales: {total_sections_added} '
      f'| Promedio por registro: {avg:.1f} '
      f'| Sin datos: {skipped}')

if DRY_RUN:
    print('\nEjecuta sin --dry-run para aplicar los cambios.')
    sys.exit(0)

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(seed_data, f, ensure_ascii=False, indent=2)

print(f'\n✓ seed_data.json actualizado.')
print('Ahora ejecuta: set -a && source .env && set +a && npx tsx scripts/sync_neon.ts')
