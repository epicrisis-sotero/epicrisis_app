#!/usr/bin/env python3
"""
PDF → HTML converter that preserves the exact spatial geometry of the original.
Each word is placed with absolute CSS positioning using coordinates extracted
from the PDF. The result is a self-contained HTML file that visually mirrors
the original page layout.

Usage:
    pip install pdfplumber --break-system-packages
    python pdf_to_html.py input.pdf [output.html]
"""

import os
import re
import sys
import json
import html
import argparse
import unicodedata
import pdfplumber
from PIL import ImageFont

# ── helpers ──────────────────────────────────────────────────────────────────

def rgb_to_css(color):
    """Convert pdfplumber color (0-1 floats or None) to CSS hex."""
    if color is None:
        return "#000000"
    if isinstance(color, (int, float)):
        v = int(color * 255)
        return f"#{v:02x}{v:02x}{v:02x}"
    if len(color) == 3:
        r, g, b = [int(c * 255) for c in color]
        return f"#{r:02x}{g:02x}{b:02x}"
    return "#000000"


def extract_pages(pdf_path):
    """Return a list of page dicts, each with width/height, chars and shapes."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            chars = page.chars  # list of char dicts with x0,y0,x1,y1,text,size,fontname,non_stroking_color
            pages.append({
                "number": page_num,
                "width":  page.width,
                "height": page.height,
                "chars":  chars,
                "shapes": extract_shapes(page),
            })

    name = extract_patient_name(pages[0]["chars"], pages[0]["height"]) if pages else None
    for page_data in pages:
        page_data["redactions"] = find_name_redactions(page_data, name)

    return pages, name


def group_lines(chars, page_height):
    """
    Group characters into text lines, preserving a 1:1 mapping between the
    line's text and the underlying character objects (no synthetic spaces).
    Returns a list of (line_text, line_chars) tuples.
    """
    if not chars:
        return []

    sorted_chars = sorted(chars, key=lambda c: (round(page_height - c["y1"], 1), c["x0"]))

    lines = []
    current_chars = []
    current_top = None
    for c in sorted_chars:
        text = c.get("text", "")
        if text == "\n":
            continue
        top = round(page_height - c["y1"], 2)
        if current_top is None or abs(top - current_top) > 1.5:
            if current_chars:
                lines.append(("".join(ch["text"] for ch in current_chars), current_chars))
            current_chars = [c]
            current_top = top
        else:
            current_chars.append(c)

    if current_chars:
        lines.append(("".join(ch["text"] for ch in current_chars), current_chars))

    return lines


def extract_patient_name(first_page_chars, page_height):
    """Extract the value of the 'Nombre :' field on the first page."""
    for line_text, _ in group_lines(first_page_chars, page_height):
        m = re.search(r"Nombre\s*:\s*(.+?)\s*Rut\s*:", line_text)
        if m:
            return m.group(1).strip()
    return None


# Spanish name particles that are too generic / too likely to collide with
# normal words to be redacted on their own.
_NAME_PARTICLES = {
    "de", "del", "la", "las", "los", "el", "y", "san", "santa",
    "do", "dos", "da", "von", "van",
}


def name_search_terms(name):
    """
    Return the search terms to redact: the full name plus each individual
    first/last name in it (skipping short connector words).
    """
    terms = [name]
    for word in name.split():
        if len(word) >= 3 and word.lower() not in _NAME_PARTICLES:
            terms.append(word)
    # Longest terms first so the full name is matched before its parts.
    return sorted(set(terms), key=len, reverse=True)


def merge_ranges(ranges):
    """Merge overlapping/adjacent (start, end) index ranges."""
    if not ranges:
        return []
    ranges = sorted(ranges)
    merged = [ranges[0]]
    for start, end in ranges[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))
    return merged


def _is_boundary(text, pos):
    """
    True if `pos` is a word boundary, treating a lowercase->uppercase
    transition as a boundary too -- PDF text often glues a value directly to
    the next field's label (e.g. "...MirandaRut:...") with no space.
    """
    if pos <= 0 or pos >= len(text):
        return True
    prev, nxt = text[pos - 1], text[pos]
    if not prev.isalpha() or not nxt.isalpha():
        return True
    return prev.islower() and nxt.isupper()


def _fold(text):
    """
    Strip accents while preserving string length (1 char in -> 1 char out),
    so indices into the folded string still line up with `line_chars`.
    """
    return "".join(unicodedata.normalize("NFKD", c)[0] for c in text)


def find_term_matches(line_text, term):
    """Find accent-/case-insensitive occurrences of `term` in line_text at word boundaries."""
    matches = []
    lower_line, lower_term = _fold(line_text).lower(), _fold(term).lower()
    start = 0
    while True:
        idx = lower_line.find(lower_term, start)
        if idx == -1:
            break
        end = idx + len(term)
        if _is_boundary(line_text, idx) and _is_boundary(line_text, end):
            matches.append((idx, end))
        start = idx + 1
    return matches


def find_name_redactions(page_data, name):
    """
    Return bounding boxes (in PDF points) covering every occurrence of the
    patient's full name, first name(s) or last name(s) anywhere on the page.
    """
    if not name:
        return []

    terms = name_search_terms(name)

    h = page_data["height"]
    boxes = []
    for line_text, line_chars in group_lines(page_data["chars"], h):
        ranges = []
        for term in terms:
            ranges.extend(find_term_matches(line_text, term))

        for start, end in merge_ranges(ranges):
            match_chars = line_chars[start:end]
            x0 = min(ch["x0"] for ch in match_chars)
            x1 = max(ch["x1"] for ch in match_chars)
            y0 = min(ch["y0"] for ch in match_chars)
            y1 = max(ch["y1"] for ch in match_chars)
            boxes.append({
                "top":    round(h - y1, 2),
                "left":   round(x0, 2),
                "width":  round(x1 - x0, 2),
                "height": round(y1 - y0, 2),
            })

    return boxes


def is_whiteish(color, threshold=0.95):
    """True if a pdfplumber color is None or effectively white."""
    if color is None:
        return True
    if isinstance(color, (int, float)):
        return color >= threshold
    return all(c >= threshold for c in color[:3])


def extract_shapes(page):
    """
    Return the filled background boxes (e.g. the gray section headers) and
    ruling lines (e.g. the black bars under section headers) of a page,
    converted to top-left/width/height in PDF points ready for CSS.
    """
    h = page.height
    shapes = []

    for r in page.rects:
        if not r.get("fill"):
            continue
        color = r.get("non_stroking_color")
        if is_whiteish(color):
            continue
        shapes.append({
            "top":    round(h - r["y1"], 2),
            "left":   round(r["x0"], 2),
            "width":  round(r["width"], 2),
            "height": round(r["height"], 2),
            "color":  rgb_to_css(color),
        })

    for l in page.lines:
        color = l.get("stroking_color")
        if is_whiteish(color):
            continue
        x0, x1 = sorted((l["x0"], l["x1"]))
        y0, y1 = sorted((l["y0"], l["y1"]))
        thickness = max(l.get("linewidth") or 0.75, 0.75)

        if (y1 - y0) <= (x1 - x0):  # horizontal line
            shapes.append({
                "top":    round(h - y1 - thickness / 2, 2),
                "left":   round(x0, 2),
                "width":  round(x1 - x0, 2),
                "height": round(thickness, 2),
                "color":  rgb_to_css(color),
            })
        else:  # vertical line
            shapes.append({
                "top":    round(h - y1, 2),
                "left":   round(x0 - thickness / 2, 2),
                "width":  round(thickness, 2),
                "height": round(y1 - y0, 2),
                "color":  rgb_to_css(color),
            })

    return shapes


def group_chars_into_spans(chars, page_height):
    """
    Group adjacent characters that share the same font/size/color into spans.
    Returns a list of span dicts ready to emit as HTML.

    pdfplumber uses bottom-left origin (y0 = distance from bottom).
    HTML uses top-left origin, so we flip: css_top = page_height - y1
    """
    if not chars:
        return []

    spans = []
    # Sort by top-to-bottom, then left-to-right
    sorted_chars = sorted(chars, key=lambda c: (round(page_height - c["y1"], 1), c["x0"]))

    current = None
    for c in sorted_chars:
        text = c.get("text", "")
        if not text or text == "\n":
            continue

        font  = c.get("fontname", "")
        size  = round(c.get("size", 12), 2)
        color = rgb_to_css(c.get("non_stroking_color"))
        top   = round(page_height - c["y1"], 2)
        left  = round(c["x0"], 2)
        right = round(c["x1"], 2)

        # Start a new span or extend the current one
        if (current is None
                or font  != current["font"]
                or size  != current["size"]
                or color != current["color"]
                or abs(top - current["top"]) > 1.5          # different line
                or (left - current["right"]) > size * 0.6): # too wide a gap
            if current:
                spans.append(current)
            current = {
                "text":  text,
                "font":  font,
                "size":  size,
                "color": color,
                "top":   top,
                "left":  left,
                "right": right,
            }
        else:
            # Check if we need to insert a space
            gap = left - current["right"]
            if gap > size * 0.15:
                current["text"] += " "
            current["text"]  += text
            current["right"]  = right

    if current:
        spans.append(current)

    return spans


def is_bold(fontname):
    fn = fontname.lower()
    return "bold" in fn or "heavy" in fn or "black" in fn


def is_italic(fontname):
    fn = fontname.lower()
    return "italic" in fn or "oblique" in fn


def font_family(fontname):
    """Derive a reasonable CSS font-family from the PDF font name."""
    fn = fontname.lower()
    if any(x in fn for x in ["courier", "mono", "consol", "typewriter"]):
        return "monospace"
    if any(x in fn for x in ["times", "georgia", "garamond", "palatino", "serif"]):
        return "Georgia, serif"
    if any(x in fn for x in ["helvetica", "arial", "calibri", "verdana", "sans"]):
        return "Arial, sans-serif"
    return "Arial, sans-serif"  # safe default


# ── span width correction ──────────────────────────────────────────────────
#
# The HTML is rendered with substitute web fonts (Arial/Georgia/monospace),
# which are metrically wider than the embedded PDF fonts. Without correction
# this makes long lines overflow past the page edge. We estimate the width a
# span will take in the substitute font (using the metric-compatible DejaVu
# fonts as a stand-in) and apply a horizontal `scaleX` so each span ends up
# the same width as in the original PDF.

_DEJAVU_DIR = "/usr/share/fonts/truetype/dejavu"

_DEJAVU_FILES = {
    ("Arial, sans-serif", False, False): "DejaVuSans.ttf",
    ("Arial, sans-serif", True,  False): "DejaVuSans-Bold.ttf",
    ("Arial, sans-serif", False, True):  "DejaVuSans-Oblique.ttf",
    ("Arial, sans-serif", True,  True):  "DejaVuSans-BoldOblique.ttf",
    ("Georgia, serif",    False, False): "DejaVuSerif.ttf",
    ("Georgia, serif",    True,  False): "DejaVuSerif-Bold.ttf",
    ("Georgia, serif",    False, True):  "DejaVuSerif-Italic.ttf",
    ("Georgia, serif",    True,  True):  "DejaVuSerif-BoldItalic.ttf",
    ("monospace",         False, False): "DejaVuSansMono.ttf",
    ("monospace",         True,  False): "DejaVuSansMono-Bold.ttf",
    ("monospace",         False, True):  "DejaVuSansMono-Oblique.ttf",
    ("monospace",         True,  True):  "DejaVuSansMono-BoldOblique.ttf",
}

_FONT_SCALE = 4  # render fonts at 4x for sub-pixel accuracy when measuring
_font_cache = {}


def _load_font(family, bold, italic, size):
    key = (family, bold, italic, round(size, 2))
    font = _font_cache.get(key)
    if font is None:
        fname = _DEJAVU_FILES.get((family, bold, italic), "DejaVuSans.ttf")
        path  = os.path.join(_DEJAVU_DIR, fname)
        font  = ImageFont.truetype(path, size=max(int(size * _FONT_SCALE), 1))
        _font_cache[key] = font
    return font


def span_scale_x(text, family, bold, italic, size, target_width):
    """
    Horizontal scale factor to make `text`, rendered in the given substitute
    font/size, occupy `target_width` (the width measured in the PDF).
    """
    if not text.strip() or target_width <= 0:
        return 1.0
    font = _load_font(family, bold, italic, size)
    natural_width = font.getlength(text) / _FONT_SCALE
    if natural_width <= 0:
        return 1.0
    scale = target_width / natural_width
    return max(0.5, min(1.0, scale))


# ── HTML rendering ────────────────────────────────────────────────────────────

PAGE_MARGIN_PX = 40  # extra space between pages

HTML_HEAD = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PDF renderizado</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #4a4a4a;
    font-family: Arial, sans-serif;
    padding: 32px 16px;
    min-height: 100vh;
  }

  #pages-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: {GAP}px;
  }

  .pdf-page {
    position: relative;
    background: #fff;
    box-shadow: 0 4px 24px rgba(0,0,0,.45);
    overflow: hidden;
  }

  .pdf-rect {
    position: absolute;
  }

  .pdf-span {
    position: absolute;
    white-space: pre;
    line-height: 1;
    user-select: text;
  }

  .pdf-redact {
    position: absolute;
    background: #000;
  }

  .page-label {
    text-align: center;
    color: #ccc;
    font-size: 11px;
    letter-spacing: .05em;
    margin-bottom: 4px;
  }

  .page-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
</head>
<body>
<div id="pages-wrapper">
""".replace("{GAP}", str(PAGE_MARGIN_PX))

HTML_FOOT = """
</div>
</body>
</html>
"""


def page_to_html(page_data):
    """Return the HTML fragment for one page."""
    w  = page_data["width"]
    h  = page_data["height"]
    n  = page_data["number"]
    spans = group_chars_into_spans(page_data["chars"], h)

    lines = []
    lines.append(f'<div class="page-wrapper">')
    lines.append(f'  <div class="page-label">Página {n}</div>')
    lines.append(
        f'  <div class="pdf-page" style="width:{w}pt; height:{h}pt;">'
    )

    for sh in page_data["shapes"]:
        css = (
            f"top:{sh['top']}pt; left:{sh['left']}pt; "
            f"width:{sh['width']}pt; height:{sh['height']}pt; "
            f"background:{sh['color']};"
        )
        lines.append(f'    <div class="pdf-rect" style="{css}"></div>')

    for s in spans:
        txt     = html.escape(s["text"])
        top     = s["top"]
        left    = s["left"]
        size    = s["size"]
        color   = s["color"]
        ff      = font_family(s["font"])
        bold    = is_bold(s["font"])
        italic  = is_italic(s["font"])
        weight  = "bold"   if bold   else "normal"
        style_  = "italic" if italic else "normal"

        scale = span_scale_x(s["text"], ff, bold, italic, size, s["right"] - left)

        css = (
            f"top:{top}pt; left:{left}pt; "
            f"font-family:{ff}; font-size:{size}pt; "
            f"font-weight:{weight}; font-style:{style_}; "
            f"color:{color};"
        )
        if scale < 0.999:
            css += f" transform: scaleX({scale:.4f}); transform-origin: left top;"
        lines.append(f'    <span class="pdf-span" style="{css}">{txt}</span>')

    margin = 1  # pt of extra coverage so the black bar fully hides the text
    for box in page_data["redactions"]:
        css = (
            f"top:{box['top'] - margin}pt; left:{box['left'] - margin}pt; "
            f"width:{box['width'] + 2 * margin}pt; height:{box['height'] + 2 * margin}pt;"
        )
        lines.append(f'    <div class="pdf-redact" style="{css}"></div>')

    lines.append("  </div>")
    lines.append("</div>")
    return "\n".join(lines)


# ── main ──────────────────────────────────────────────────────────────────────

def convert(pdf_path, html_path):
    print(f"Leyendo {pdf_path} …")
    pages, name = extract_pages(pdf_path)
    print(f"  {len(pages)} página(s) encontradas.")

    if name:
        total_redactions = sum(len(p["redactions"]) for p in pages)
        print(f"  Paciente detectado: '{name}' -> {total_redactions} mención(es) anonimizada(s).")
    else:
        print("  No se pudo detectar el nombre del paciente; no se aplicó anonimización.")

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(HTML_HEAD)
        for page_data in pages:
            f.write(page_to_html(page_data))
            f.write("\n")
        f.write(HTML_FOOT)

    print(f"HTML guardado en {html_path}")


def convert_directory(input_dir, output_dir):
    """Convert every PDF found in input_dir into an HTML file inside output_dir."""
    os.makedirs(output_dir, exist_ok=True)

    pdf_files = sorted(
        f for f in os.listdir(input_dir) if f.lower().endswith(".pdf")
    )
    print(f"Encontrados {len(pdf_files)} PDF(s) en '{input_dir}'.")

    for i, fname in enumerate(pdf_files, 1):
        pdf_path  = os.path.join(input_dir, fname)
        html_name = os.path.splitext(fname)[0] + ".html"
        html_path = os.path.join(output_dir, html_name)

        print(f"\n[{i}/{len(pdf_files)}] {fname}")
        try:
            convert(pdf_path, html_path)
        except Exception as exc:
            print(f"  ERROR al procesar '{fname}': {exc}")


def main():
    parser = argparse.ArgumentParser(
        description="Convierte uno o varios PDF a HTML preservando la geometría exacta del texto."
    )
    parser.add_argument("input", help="Ruta a un archivo PDF o a una carpeta con PDFs")
    parser.add_argument(
        "output", nargs="?",
        help="Ruta al HTML de salida (si 'input' es un archivo) o carpeta de salida "
             "(si 'input' es una carpeta). Por defecto: mismo nombre con sufijo ' HTML'."
    )
    args = parser.parse_args()

    if os.path.isdir(args.input):
        output_dir = args.output or args.input.rstrip("/\\") + " HTML"
        convert_directory(args.input, output_dir)
    else:
        html_out = args.output or args.input.rsplit(".", 1)[0] + ".html"
        convert(args.input, html_out)


if __name__ == "__main__":
    main()