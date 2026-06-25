# pdf_to_html.py

Convierte PDFs de epicrisis hospitalaria a HTML preservando la geometría visual exacta del original, con anonimización automática del nombre del paciente.

## Características

- **Posicionamiento absoluto**: cada fragmento de texto se ubica en el HTML con las mismas coordenadas `(x, y, ancho, alto)` que tiene en el PDF original.
- **Fidelidad visual**: reproduce los recuadros grises de encabezado de sección y las barras negras separadoras directamente desde los metadatos de formas del PDF.
- **Corrección de fuentes**: los PDFs usan fuentes embebidas (ej. `DEVEXP+Arial`) que los navegadores no tienen. El script mide el ancho real del texto con métricas DejaVu y aplica `transform: scaleX(...)` para que cada span ocupe exactamente el ancho original, evitando overflow o corte de texto.
- **Anonimización FBI-style**: detecta automáticamente el nombre del paciente desde el campo `Nombre :` y cubre con un bloque negro sólido toda mención del nombre completo, nombre(s) y apellido(s) en cualquier parte del documento. La búsqueda es insensible a mayúsculas/minúsculas y a tildes (ej. `Jose` encuentra `José`).
- **Procesamiento por lotes**: acepta una carpeta entera de PDFs y genera un HTML por cada uno.

---

## Instalación

Requiere Python 3.8+ y las siguientes dependencias externas:

```bash
# Crear entorno virtual (recomendado)
python3 -m venv venv
source venv/bin/activate   # Linux/macOS
# venv\Scripts\activate    # Windows

# Instalar dependencias
pip install pdfplumber Pillow
```

La corrección de fuentes usa las fuentes **DejaVu** del sistema. En Ubuntu/Debian suelen estar ya instaladas; si no:

```bash
sudo apt install fonts-dejavu-core
```

---

## Uso

### Un solo archivo

```bash
python pdf_to_html.py paciente.pdf
# → genera paciente.html en el mismo directorio

python pdf_to_html.py paciente.pdf salida/resultado.html
# → genera salida/resultado.html
```

### Carpeta completa

```bash
python pdf_to_html.py "Epicrisis PDFs/"
# → genera "Epicrisis PDFs HTML/" con un .html por cada .pdf

python pdf_to_html.py "Epicrisis PDFs/" "mi_salida/"
# → genera los HTMLs en "mi_salida/"
```

---

## Dependencias

### Externas

| Librería | Versión mínima | Para qué se usa |
|---|---|---|
| [pdfplumber](https://github.com/jsvine/pdfplumber) | 0.9+ | Extrae caracteres (posición, fuente, tamaño, color), rectángulos y líneas de cada página del PDF |
| [Pillow](https://python-pillow.org/) (`PIL.ImageFont`) | 9.0+ | Mide el ancho de texto con fuentes DejaVu para calcular el factor de escala horizontal de cada span |

### Stdlib de Python (sin instalación)

| Módulo | Uso |
|---|---|
| `os` | Manejo de rutas y directorios |
| `re` | Regex para extraer el campo `Nombre :` |
| `html` | `html.escape()` para sanitizar texto al generar HTML |
| `argparse` | Parsing de argumentos CLI |
| `unicodedata` | `normalize("NFKD", c)` para eliminar tildes en la búsqueda de nombres |
| `sys`, `json` | Utilidades generales |

### Fuentes del sistema

| Recurso | Ruta | Uso |
|---|---|---|
| DejaVu Sans / Serif / Mono | `/usr/share/fonts/truetype/dejavu/` | Métricas de referencia para corrección de ancho de spans |

---

## Cómo funciona internamente

```
PDF
 │
 ├─ pdfplumber.open()
 │    ├─ page.chars      → coordenadas + texto de cada carácter
 │    ├─ page.rects      → rectángulos rellenos (ej. fondo gris de sección)
 │    └─ page.lines      → líneas (ej. barra negra separadora)
 │
 ├─ extract_patient_name()
 │    └─ busca "Nombre : ... Rut :" en la primera página → nombre del paciente
 │
 ├─ find_name_redactions()
 │    ├─ name_search_terms() → nombre completo + cada nombre/apellido individual
 │    ├─ find_term_matches()  → búsqueda sin tildes ni distinción de case,
 │    │                         con detección de límite de palabra (incluyendo
 │    │                         transición minúscula→MAYÚSCULA, ya que los PDFs
 │    │                         a veces pegan el valor con la siguiente etiqueta:
 │    │                         "MirandaRut:" en lugar de "Miranda Rut:")
 │    └─ bounding boxes de cada match → redactions[]
 │
 ├─ group_chars_into_spans()
 │    └─ agrupa caracteres adyacentes con misma fuente/tamaño/color en spans
 │
 ├─ span_scale_x()
 │    └─ Pillow mide ancho con DejaVu → scaleX = ancho_PDF / ancho_DejaVu
 │
 └─ page_to_html()
      ├─ 1. <div class="pdf-rect">  → formas (fondos, líneas)
      ├─ 2. <span class="pdf-span"> → texto con posicionamiento absoluto + scaleX
      └─ 3. <div class="pdf-redact">→ bloques negros de anonimización (encima del texto)
```

El sistema de coordenadas del PDF tiene origen en la esquina inferior-izquierda (y crece hacia arriba). El HTML usa esquina superior-izquierda (y crece hacia abajo). La conversión es: `css_top = page_height - pdf_y1`.

---

## Notas sobre la anonimización

- Se redactan el nombre completo **y** cada nombre/apellido individualmente (longitud ≥ 3 letras, excluyendo partículas como `de`, `del`, `la`, `von`, etc.).
- La búsqueda es **conservadora por exceso**: si un apellido del paciente coincide con el nombre de otra persona en el documento (ej. tutor o usuario de impresión), ese texto también quedará redactado. Esto es intencional — más privacidad ante la duda.
- Si el script no encuentra el patrón `Nombre : ... Rut :` en la primera página, no se aplica ninguna anonimización y se imprime un aviso en consola.
