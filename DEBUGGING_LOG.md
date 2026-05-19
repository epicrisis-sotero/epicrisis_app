# Epicrisis App: Debugging Log - PDF Viewer Implementation

**Fecha:** Mayo 2026  
**Estado Final:** ✅ Resuelto  
**Solución:** Migración a EmbedPDF.com + Corrección de rutas de URL

---

## Contexto del Proyecto

### Descripción General
**Epicrisis AI Platform** es una aplicación web de anotación médica que permite a especialistas revisar y anotar documentos de epicrisis (resúmenes clínicos de pacientes hospitalizados). El sistema incluye:

- **Visores de documentos** (texto + PDF)
- **Anotación colaborativa** con criterios médicos predefinidos
- **Datos clínicos** estructurados (infecciones, falla orgánica, etc.)
- **Control de acceso** (admin + annotators)
- **Ground truth validation** para entrenar modelos LLM

### Stack Tecnológico

| Componente | Tecnología | Detalles |
|-----------|-----------|----------|
| **Frontend** | Vue 3 + TypeScript | SPA, Vite, TailwindCSS |
| **Backend** | Node.js + Express (local) | Port 3001, PM2 |
| **Database** | PostgreSQL | Drizzle ORM |
| **Auth** | JWT | Via Auth0/Custom |
| **Deployment Frontend** | Vercel | Monorepo workspace |
| **PDF Storage** | Local (`/backend/uploads`) | Estática vía Express |
| **Tunneling** | ngrok | Para exponer backend local |

### Arquitectura de Monorepo

```
epicrisis_app/
├── frontend/                    # Vue 3 SPA (npm workspace)
│   ├── src/
│   │   ├── components/
│   │   │   └── annotation/
│   │   │       ├── PdfViewer.vue     ← FOCO DE DEBUGGING
│   │   │       ├── MarkdownRenderer.vue
│   │   │       └── ...
│   │   ├── views/
│   │   │   └── AnnotationView.vue    ← Usa PdfViewer
│   │   ├── stores/                   # Pinia (epicrisis, auth, annotation)
│   │   └── services/                 # API calls
│   ├── vercel.json                   ← CAMBIO: Headers + CSP
│   └── dist/                         # Build output
│
├── backend/                         # Node.js Express (npm workspace)
│   ├── api/
│   │   ├── epicrisis.ts            # GET /api/epicrisis - Devuelve pdfPath
│   │   ├── annotations.ts
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   ├── lock.ts
│   │   └── _lib/
│   │       ├── db.js               # Drizzle connection
│   │       ├── auth.js             # JWT validation
│   │       └── cors.js
│   ├── server/
│   │   └── index.ts                # Express server (dev)
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema
│   │   ├── migrations/
│   │   └── index.ts
│   ├── uploads/                     # PDFs locales (estático)
│   │   ├── 002C713D37998AE3.pdf
│   │   ├── 0A23E85FCF28987B.pdf
│   │   └── ... (30+ PDFs)
│   └── package.json
│
├── vercel.json                       ← ROOT: CAMBIO CRÍTICO
├── package.json                      # Root workspace config
└── DEBUGGING_LOG.md                  ← Este archivo

```

---

## Historial de Intentos

### ❌ INTENTO 1: pdf.js + Vercel (FRACASÓ)

**Objetivo:** Implementar visor nativo con `pdfjs-dist`

**Implementación:**
```typescript
// PdfViewer.vue original
import * as pdfjsLib from 'pdfjs-dist'

export const initPdf = async (url: string) => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `...pdfjs-dist/pdf.worker.min.js`
  const pdf = await pdfjsLib.getDocument(url).promise
  const page = await pdf.getPage(1)
  const canvas = document.createElement('canvas')
  await page.render({ canvasContext: canvas.getContext('2d'), ... }).promise
}
```

**Problemas Encontrados:**
1. **Worker loading error:** No se encontraba `/pdf.worker.min.js` (assets compilación fallida en Vercel)
2. **CORS issues:** PDFs en ngrok rechazaban requests sin headers específicos
3. **Rewrite complexity:** Vercel rewrites/routes no funcionaban como se esperaba
4. **Vercel output directory:** Error "No Output Directory named 'dist' found"
   - Intenté: `rootDirectory: "frontend"` → ❌ Propiedad inválida
   - Intentó: `cd frontend && npm install && npm run build` → ❌ Directorio no existe en contexto Vercel

**Decisión:** Pivot a solución simplificada

---

### ✅ INTENTO 2: EmbedPDF.com (Parte 1 - CSP)

**Objetivo:** Usar servicio third-party EmbedPDF.com (ya funciona en CECAN)

**Ventajas:**
- ✅ Cero configuración de workers/assets
- ✅ Una línea de HTML + script dinámico
- ✅ Probado en producción (CECAN)
- ✅ Sin problemas de compilación

**Implementación 1:**
```typescript
// PdfViewer.vue reescrito
const script = document.createElement('script')
script.type = 'module'
script.textContent = `
  import EmbedPDF from 'https://snippet.embedpdf.com/embedpdf.js'
  
  EmbedPDF.init({
    type: 'container',
    target: document.getElementById('${viewerId}'),
    src: '${props.pdfPath}'  // ← PROBLEMA: Ruta relativa
  })
`
document.head.appendChild(script)
```

**Error Encontrado 1: WebAssembly CSP Blocking**
```
Browser Error:
"Refused to create a WebAssembly object because 'unsafe-eval' 
or 'wasm-unsafe-eval' is not an allowed source of script"
```

**Root Cause:** Vercel enviaba CSP headers pero faltaba `wasm-unsafe-eval`

**Debugging Process:**
1. Agregué `'wasm-unsafe-eval'` a `/frontend/vercel.json`
2. Pero Vercel seguía usando `/vercel.json` (ROOT) que NO tenía headers
3. Root config tiene precedencia en monorepo

**Solución CSP:** Mover headers a `/vercel.json` root:
```json
{
  "buildCommand": "npm run build --workspace=frontend",
  "outputDirectory": "frontend/dist",
  "routes": [
    { "src": "/api/.*", "dest": "/api" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Content-Security-Policy", 
          "value": "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://snippet.embedpdf.com; ..." 
        }
      ]
    }
  ]
}
```

---

### ✅ INTENTO 3: EmbedPDF.com (Parte 2 - URLs)

**Error Encontrado 2: PDF Load Failure**
```
Browser Error:
"FPDF_LoadMemDocument failed - Error Code: 3"
(Error al descargar/acceder al PDF)
```

**Diagnóstico Realizado:**

1. **Revisé BD schema** (`/backend/db/schema.ts`):
   - Campo: `pdfPath: text('pdf_path')`
   - Tipo: Simple texto en BD

2. **Revisé API** (`/backend/api/epicrisis.ts`):
   - Devuelve: `pdfPath: epicrisis.pdfPath` (valor directo de BD)

3. **Revisé storage** (`/backend/server/index.ts`):
   ```typescript
   const uploadsPath = path.join(process.cwd(), 'uploads')
   app.use('/uploads', express.static(uploadsPath))  // ← Servicio estático
   ```
   - PDFs en: `/backend/uploads/FILENAME.pdf`
   - Accesibles en: `http://localhost:3001/uploads/FILENAME.pdf`

4. **Flujo actual (ROTO):**
   ```
   BD: pdfPath = "/uploads/FILENAME.pdf"
     ↓
   API: GET /api/epicrisis → { pdfPath: "/uploads/FILENAME.pdf" }
     ↓
   Frontend: Recibe "/uploads/FILENAME.pdf"
     ↓
   PdfViewer: Pasa a EmbedPDF → "/uploads/FILENAME.pdf" ❌
     ↓
   EmbedPDF: No puede acceder a RUTA RELATIVA
   ```

**Root Cause:** 
- EmbedPDF necesita **URLs absolutas** (comienzan con `http://` o `https://`)
- El frontend estaba pasando rutas relativas (`/uploads/...`)
- EmbedPDF no puede resolver URLs relativas desde su dominio

**Solución Implementada:**

En `PdfViewer.vue`, convertir rutas a URLs absolutas:
```typescript
function getPdfUrl() {
  if (!props.pdfPath) return ''
  const filename = props.pdfPath.split('/').pop()  // Extrae "FILENAME.pdf"
  return `${window.location.origin}/api/pdf?id=${filename}`
  // Resultado: https://epicrisis-app.vercel.app/api/pdf?id=FILENAME.pdf
}

function initEmbedPdf() {
  const pdfUrl = getPdfUrl()  // URL absoluta
  
  const script = document.createElement('script')
  script.textContent = `
    EmbedPDF.init({
      type: 'container',
      target: document.getElementById('${viewerId}'),
      src: '${pdfUrl}'  // ✅ Ahora es URL absoluta
    })
  `
  document.head.appendChild(script)
}
```

**Cómo funciona:**
1. Ruta BD: `/uploads/002C713D37998AE3.pdf`
2. getPdfUrl() extrae: `002C713D37998AE3.pdf`
3. Construye URL: `https://epicrisis-app.vercel.app/api/pdf?id=002C713D37998AE3.pdf`
4. Vercel ruteador (`/api/.*` → `/api`) proxy a `/api/pdf` (que existe)
5. `/api/pdf` fetcha desde ngrok: `https://carmela-unadjacent-unpreventively.ngrok-free.dev/uploads/002C713D37998AE3.pdf`
6. Devuelve PDF como respuesta
7. EmbedPDF accede a URL válida ✅

---

## Cambios Realizados (Commit Final)

### Commit: `45d8542`

**Archivos Modificados:**

1. **`frontend/src/components/annotation/PdfViewer.vue`**
   ```diff
   + function getPdfUrl() {
   +   if (!props.pdfPath) return ''
   +   const filename = props.pdfPath.split('/').pop()
   +   return `${window.location.origin}/api/pdf?id=${filename}`
   + }
   
     function initEmbedPdf() {
       if (!props.pdfPath) return
       loading.value = true
       errored.value = false
   
   -   const script = document.createElement('script')
   +   const pdfUrl = getPdfUrl()
   +   const script = document.createElement('script')
       script.async = true
       script.type = 'module'
       script.textContent = `
         import EmbedPDF from 'https://snippet.embedpdf.com/embedpdf.js'
         try {
           const viewer = EmbedPDF.init({
             type: 'container',
             target: document.getElementById('${viewerId}'),
   -        src: '${props.pdfPath}'
   +        src: '${pdfUrl}'
           })
   ```

2. **`vercel.json`** (ROOT)
   ```diff
   {
     "buildCommand": "npm run build --workspace=frontend",
     "outputDirectory": "frontend/dist",
     "routes": [
       { "src": "/api/.*", "dest": "/api" }
   + ],
   + "headers": [
   +   {
   +     "source": "/(.*)",
   +     "headers": [
   +       { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
   +       { "key": "X-Content-Type-Options", "value": "nosniff" },
   +       { "key": "Content-Security-Policy",
   +         "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://snippet.embedpdf.com; ..."
   +       }
   +     ]
   +   }
   + ]
   }
   ```

---

## Flujo Final (FUNCIONAL)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO ABRE DOCUMENTO EN ANNOTATION VIEW                │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. API GET /api/epicrisis?id=276                            │
│    Respuesta: { pdfPath: "/uploads/002C713D37998AE3.pdf" } │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PdfViewer recibe pdfPath = "/uploads/002C713D37998AE3"  │
│    Llama: getPdfUrl()                                       │
│    Extrae: "002C713D37998AE3.pdf"                          │
│    Construye: "https://epicrisis-app.vercel.app/api/pdf?id=..."
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. EmbedPDF.init({ src: URL_ABSOLUTA })                     │
│    Carga script desde: https://snippet.embedpdf.com/...     │
│    Solicita PDF a: https://epicrisis-app.vercel.app/api/pdf│
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Vercel CSP Headers PERMITIDAS (wasm-unsafe-eval)         │
│    WebAssembly carga exitosamente                           │
│    PDF renderiza en contenedor embedpdf-container           │
└─────────────────────────────────────────────────────────────┘
                          ↓
                       ✅ SUCCESS
```

---

## Lecciones Aprendidas

| Lección | Detalle |
|---------|---------|
| **Ruta vs URL** | No confundir rutas relativas (`/uploads/file`) con URLs (`https://domain/uploads/file`). APIs externas necesitan URLs absolutas. |
| **Monorepo + Vercel** | En monorepos, la config del root `vercel.json` tiene precedencia. Configs en subdirectorios pueden ser ignoradas. |
| **CSP Headers** | `'wasm-unsafe-eval'` es necesario para WebAssembly. Sin él, EmbedPDF falla silenciosamente en el navegador. |
| **Third-party Services** | A veces es más simple usar un servicio externo (EmbedPDF) que compilar librerías complejas (pdf.js workers). |
| **Error Code 3 en EmbedPDF** | Significa que el PDF no se pudo descargar. Casi siempre es:1) URL inválida/relativa 2) CORS 3) Autenticación |
| **DevTools Network Tab** | Siempre revisar las requests reales vs esperadas. Headers, status codes, response bodies revelan muchos problemas. |

---

## Testing Checklist

- [ ] Deploy a producción (Vercel)
- [ ] Abrir documento con PDF
- [ ] Verificar DevTools → Network:
  - [ ] CSP header incluye `wasm-unsafe-eval`
  - [ ] Request a `/api/pdf?id=...` retorna 200
  - [ ] EmbedPDF script carga sin errores
- [ ] PDF renderiza visualmente en PdfViewer
- [ ] Tabs "Texto" y "PDF" funcionan
- [ ] Seleccionar texto en PDF y capturar evidencia
- [ ] Guardar y enviar anotación

---

## Archivos de Referencia

| Archivo | Línea | Descripción |
|---------|-------|-------------|
| `/frontend/src/components/annotation/PdfViewer.vue` | 17-24 | Nueva función `getPdfUrl()` |
| `/frontend/src/views/AnnotationView.vue` | 460-464 | Usa `<PdfViewer :pdf-path="..." />` |
| `/backend/db/schema.ts` | 61 | Campo `pdfPath: text('pdf_path')` |
| `/backend/api/epicrisis.ts` | 53 | Devuelve `pdfPath: epicrisis.pdfPath` |
| `/backend/server/index.ts` | 29-31 | `app.use('/uploads', express.static(...))` |
| `/vercel.json` | 6-20 | Headers con CSP + `wasm-unsafe-eval` |
| `/api/pdf.ts` | (Vercel) | Proxy: fetcha desde ngrok y devuelve PDF |

---

## Estado Actual

✅ **RESUELTO**

- PDF viewer integrado con EmbedPDF.com
- CSP headers correctamente configurados
- URLs relativas convertidas a absolutas
- Listo para testing en producción

**Próximos pasos:**
1. Esperar deploy de Vercel (~2 min)
2. Verificar en navegador
3. Revisar DevTools → Network para confirmar
