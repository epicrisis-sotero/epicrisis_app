#!/usr/bin/env python3
"""
Carga los PDFs de db/momentaneo/ a la DB local.
Genera el patient_id con el mismo HMAC que process_pdfs.py,
busca el registro en la DB y actualiza pdf_path + pdf_data.
NO trunca nada.
"""
import hashlib, hmac, os, re
from pathlib import Path
import psycopg2

SCRIPT_DIR   = Path(__file__).parent
ROOT         = SCRIPT_DIR.parent
PDF_DIR      = ROOT / "db" / "momentaneo"
SALT_FILE    = SCRIPT_DIR / ".pdf_salt"
HMAC_PASSWORD = b"epicrisis-ihealth-2026"
DATABASE_URL  = os.environ.get("DATABASE_URL", "postgresql://fabianortega@localhost:5432/epicrisis_dev")

def load_salt() -> bytes:
    return bytes.fromhex(SALT_FILE.read_text().strip())

def make_patient_id(stem: str, salt: bytes) -> str:
    key = HMAC_PASSWORD + salt
    h = hmac.new(key, stem.encode("utf-8"), hashlib.sha256)
    return h.hexdigest()[:16].upper()

def main():
    salt = load_salt()
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    pdfs = sorted(PDF_DIR.glob("*.pdf"))
    print(f"{len(pdfs)} PDFs encontrados en {PDF_DIR}")

    updated = 0
    not_found = 0

    for pdf_path in pdfs:
        stem = pdf_path.stem
        patient_id = make_patient_id(stem, salt)
        filename = f"{patient_id}.pdf"

        pdf_data = pdf_path.read_bytes()

        cur.execute(
            "UPDATE epicrisis SET pdf_path = %s, pdf_data = %s WHERE patient_id = %s",
            (filename, psycopg2.Binary(pdf_data), patient_id)
        )

        if cur.rowcount > 0:
            updated += 1
            print(f"[OK]    {stem[:50]} → {patient_id}")
        else:
            not_found += 1
            print(f"[MISS]  {stem[:50]} → {patient_id} (no en DB)")

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nListo: {updated} actualizados, {not_found} sin match en DB.")

if __name__ == "__main__":
    main()
