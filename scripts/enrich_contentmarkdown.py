"""
Enriquece contentMarkdown en seed_data.json con secciones limpias del pipeline SQLite:
  - CONDICIÓN DE EGRESO: resumen narrativo del estado al egreso (250 registros)
  - INDICACIONES: instrucciones de alta (32 registros sin PII)

Uso:
  python3 scripts/enrich_contentmarkdown.py --dry-run   # solo reporta
  python3 scripts/enrich_contentmarkdown.py              # actualiza seed_data.json
"""
import sqlite3, json, re, sys
from pathlib import Path

DRY_RUN = '--dry-run' in sys.argv

SQLITE_PATH = Path('/home/fabian/src/proyecto_sotero_ihealth/pipeline/output/sotero_pacientes.db')
JSON_PATH = Path(__file__).parent / 'seed_data.json'

FIRMA_RE = re.compile(
    r'[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}){1,3}\s*\n\s*\d{1,2}[-/]\d{1,2}[-/]\d{4}',
    re.MULTILINE,
)


def clean_condicion(text: str) -> str:
    """Extrae solo la narrativa clínica; descarta residuos de formulario (:NO, :Sí, etc.)."""
    # Split at the first form-checkbox line (starts with bare ":")
    cleaned = re.split(r'\n\s*:', text)[0].strip()
    return cleaned if len(cleaned) >= 15 else ''


def build_extra_sections(sq: dict) -> str:
    parts = []

    cond = (sq.get('Condición de Egreso') or '').strip()
    if cond:
        cond_clean = clean_condicion(cond)
        if cond_clean and not FIRMA_RE.search(cond_clean):
            parts.append(f'CONDICIÓN DE EGRESO\n{cond_clean}')

    ind = (sq.get('Indicaciones') or '').strip()
    if ind and len(ind) >= 20 and not FIRMA_RE.search(ind):
        parts.append(f'INDICACIONES\n{ind}')

    return '\n\n'.join(parts)


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
skipped_already = 0
skipped_no_extra = 0

for record in seed_data:
    pid = record.get('patientId')
    sq = sqlite_rows.get(pid)
    if not sq:
        skipped_no_extra += 1
        continue

    current_md = record.get('contentMarkdown', '')

    # Idempotency: skip if sections already present
    if 'CONDICIÓN DE EGRESO' in current_md and 'INDICACIONES' in current_md:
        skipped_already += 1
        continue

    extra = build_extra_sections(sq)
    if not extra:
        skipped_no_extra += 1
        continue

    if DRY_RUN:
        print(f'[{pid}] would add:')
        print('  ' + extra[:200].replace('\n', '\n  '))
        print()
    else:
        record['contentMarkdown'] = current_md.rstrip() + '\n\n' + extra
    updated += 1

print(f'{"[DRY RUN] " if DRY_RUN else ""}Registros a actualizar: {updated} '
      f'(ya tenían: {skipped_already}, sin datos nuevos: {skipped_no_extra})')

if DRY_RUN:
    print('\nEjecuta sin --dry-run para aplicar los cambios a seed_data.json.')
    sys.exit(0)

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(seed_data, f, ensure_ascii=False, indent=2)

print(f'✓ seed_data.json actualizado ({updated} registros).')
print('\nAhora ejecuta: set -a && source .env && set +a && npx tsx scripts/sync_neon.ts')
