#!/usr/bin/env python3
"""
Popula epicrisis_sections desde content_markdown existente.
- Secciones enriquecidas al final del texto se extraen por marcadores ALL-CAPS.
- El texto anterior a la primera sección conocida se guarda como 'resumen_clinico'.
- Motivo de ingreso se busca en el texto libre si no viene como sección propia.
- Se omiten secciones vacías o con contenido trivial.
"""
import re
import psycopg2

DB_URL = "postgresql://fabianortega@localhost:5432/epicrisis_dev"

# Orden canónico de secciones: (section_name, label, marcadores posibles en el texto)
SECTION_DEFS = [
    ("resumen_clinico",          "Resumen Clínico",                   []),   # todo lo que antecede a las secciones conocidas
    ("motivo_ingreso",           "Motivo o Diagnóstico de Ingreso",   ["MOTIVO O DIAGNÓSTICO DE INGRESO", "MOTIVO O DIAGNOSTICO DE INGRESO"]),
    ("antecedentes",             "Antecedentes Médicos Detallados",   ["ANTECEDENTES MÉDICOS DETALLADOS", "ANTECEDENTES MEDICOS DETALLADOS"]),
    ("comorbilidades",           "Comorbilidades",                    ["COMORBILIDADES"]),
    ("procedimientos",           "Procedimientos",                    ["PROCEDIMIENTOS"]),
    ("intervenciones",           "Intervenciones Quirúrgicas",        ["INTERVENCIONES QUIRÚRGICAS", "INTERVENCIONES QUIRURGICAS"]),
    ("epidemiologia",            "Epidemiología",                     ["EPIDEMIOLOGÍA", "EPIDEMIOLOGIA"]),
    ("diagnostico_egreso",       "Diagnóstico de Egreso",             ["DIAGNÓSTICO DE EGRESO", "DIAGNOSTICO DE EGRESO"]),
    # condicion_egreso se extrae via regex (campo inline de doble columna)
    ("plan_post_alta",           "Plan Post Alta",                    ["PLAN POST ALTA"]),
    ("indicaciones",             "Indicaciones",                      ["INDICACIONES"]),
    ("controles",                "Controles",                         ["CONTROLES"]),
    ("tipo_reposo",              "Tipo de Reposo",                    ["TIPO DE REPOSO"]),
    # egreso_cateter se extrae via regex (campo SI/NO en columna del PDF, no sección)
]

CATETER_RE = re.compile(
    r'Egreso\s+con\s+Cat[eé]ter\s+Doble\s+J\s*:\s*(SI|NO|S[ií])',
    re.IGNORECASE,
)
CONDICION_RE = re.compile(
    r'Condici[oó]n\s+de\s+Egreso\s+(.+?)\s+Egreso\s+con\s+Cat[eé]ter',
    re.IGNORECASE | re.DOTALL,
)

# Todos los marcadores conocidos (para detectar dónde termina el resumen libre)
ALL_MARKERS = [m for _, _, markers in SECTION_DEFS for m in markers]

# Regex que detecta cualquier marcador al inicio de línea
MARKER_RE = re.compile(
    r'^(' + '|'.join(re.escape(m) for m in ALL_MARKERS) + r')\s*$',
    re.MULTILINE | re.IGNORECASE,
)

def normalize(text: str) -> str:
    return re.sub(r'\n{3,}', '\n\n', text).strip()

def is_meaningful(text: str) -> bool:
    stripped = re.sub(r'[\[\]\(\)\-:.,\s\n]', '', text)
    return len(stripped) >= 8

def extract_sections(markdown: str) -> dict[str, str]:
    """
    Devuelve dict {section_name: content} con secciones no vacías.
    """
    # Encontrar la posición del primer marcador conocido
    first_match = MARKER_RE.search(markdown)
    resumen = markdown[:first_match.start()].strip() if first_match else markdown.strip()

    result: dict[str, str] = {}
    if is_meaningful(resumen):
        result["resumen_clinico"] = normalize(resumen)

    # Partir el texto desde el primer marcador en bloques
    remaining = markdown[first_match.start():] if first_match else ""

    # Dividir en bloques: cada marcador inicia un bloque
    splits = MARKER_RE.split(remaining)
    # splits: ['', marker1, content1, marker2, content2, ...]
    # (el primer elemento es texto vacío antes del primer marcador)

    # Reconstruir pares (marker, content)
    pairs: list[tuple[str, str]] = []
    i = 1
    while i < len(splits) - 1:
        marker = splits[i].strip().upper()
        content = splits[i + 1].strip() if i + 1 < len(splits) else ""
        pairs.append((marker, content))
        i += 2

    # Mapear cada marcador encontrado a su section_name
    marker_to_name: dict[str, str] = {}
    for name, _, markers in SECTION_DEFS:
        for m in markers:
            marker_to_name[m.upper()] = name

    for marker, content in pairs:
        name = marker_to_name.get(marker)
        if name and is_meaningful(content):
            if name not in result:
                result[name] = normalize(content)

    # Campos inline de doble columna en el formulario
    m = CATETER_RE.search(markdown)
    if m:
        valor = m.group(1).upper()
        result["egreso_cateter"] = "Sí" if valor in ("SI", "SÍ") else "No"

    m = CONDICION_RE.search(markdown)
    if m:
        result["condicion_egreso"] = m.group(1).strip()

    return result


def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    cur.execute("SELECT id, content_markdown FROM epicrisis WHERE content_markdown IS NOT NULL AND length(content_markdown) > 50")
    rows = cur.fetchall()
    print(f"{len(rows)} registros a procesar")

    # Limpiar tabla antes de repoblar (idempotente)
    cur.execute("DELETE FROM epicrisis_sections")

    name_to_position = {name: i + 1 for i, (name, _, _) in enumerate(SECTION_DEFS)}
    name_to_label    = {name: label for name, label, _ in SECTION_DEFS}
    name_to_position["egreso_cateter"]   = 14
    name_to_label["egreso_cateter"]     = "Egreso con Catéter Doble J"
    name_to_position["condicion_egreso"] = 9
    name_to_label["condicion_egreso"]   = "Condición de Egreso"

    inserted_total = 0
    for epicrisis_id, markdown in rows:
        sections = extract_sections(markdown)
        for name, content in sections.items():
            pos   = name_to_position[name]
            label = name_to_label[name]
            cur.execute(
                """
                INSERT INTO epicrisis_sections (epicrisis_id, section_name, label, content, position)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (epicrisis_id, section_name) DO UPDATE
                  SET content = EXCLUDED.content, label = EXCLUDED.label, position = EXCLUDED.position
                """,
                (epicrisis_id, name, label, content, pos),
            )
            inserted_total += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"✓ {inserted_total} secciones insertadas para {len(rows)} epicrisis")


if __name__ == "__main__":
    main()
