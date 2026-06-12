# Plataforma de Anotación de Epicrisis

Aplicación web para la anotación de **ground truth** de epicrisis clínicas, diseñada para validar modelos de lenguaje grande (LLM) en la detección de comorbilidades en pacientes hospitalizados.

---

## Objetivo del Proyecto

El objetivo central es construir un conjunto de datos de **ground truth** médico que permita evaluar y comparar la capacidad de un modelo LLM para identificar comorbilidades presentes en documentos clínicos (epicrisis).

El flujo es el siguiente:

1. Un **administrador** carga las epicrisis (documentos clínicos en formato Markdown) a la base de datos.
2. El administrador **asigna** cada epicrisis a un anotador humano (estudiante o clínico).
3. El **anotador** lee el documento clínico y clasifica manualmente 15 comorbilidades como *presente*, *ausente* o *indeterminado*, además de justificar con evidencia textual extraída del mismo documento.
4. Las anotaciones humanas se comparan contra las predicciones del LLM para medir su rendimiento (precisión, recall, F1).

---

## Arquitectura

### Visión General

```
┌──────────────────────────────────────────────────────────────┐
│                         Cliente (SPA)                        │
│         Vue 3 + Pinia + Vue Router + Tailwind CSS            │
│                                                              │
│   LoginView  │  DashboardView  │  AnnotationView  │ AdminView│
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP / REST
┌─────────────────────────▼────────────────────────────────────┐
│                    API Serverless (Vercel)                    │
│         TypeScript Functions (api/*.ts)                      │
│                                                              │
│    /api/auth  │  /api/epicrisis  │  /api/annotations  │      │
│    /api/admin                                                │
└─────────────────────────┬────────────────────────────────────┘
                          │ Drizzle ORM (serverless driver)
┌─────────────────────────▼────────────────────────────────────┐
│                  Base de Datos PostgreSQL                    │
│                      Neon (serverless)                       │
│                                                              │
│     users   │   epicrisis   │   annotations                  │
└──────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 (Composition API + `<script setup>`) |
| Estado global | Pinia |
| Ruteo | Vue Router 4 |
| Estilos | Tailwind CSS 3 |
| Renderizado Markdown | `marked` |
| Build / Dev | Vite 5 |
| Backend | Funciones serverless de Vercel (Node 20) |
| ORM | Drizzle ORM |
| Base de datos | PostgreSQL (Neon serverless) |
| Autenticación | JWT via `jose` + cookie HTTP-only |
| Hashing contraseñas | `bcryptjs` |
| Validación | Zod |
| Despliegue | Vercel |

---

## Estructura del Proyecto

```
epicrisis_app/
├── api/                        # Funciones serverless de Vercel
│   ├── _lib/
│   │   ├── auth.ts             # Firma y verificación de JWT, helpers de cookie
│   │   └── db.ts               # Instancia de Drizzle + re-exportación de tablas
│   ├── admin.ts                # Endpoints de administración (asignación, estadísticas)
│   ├── annotations.ts          # CRUD de anotaciones
│   ├── auth.ts                 # Login, logout, sesión actual
│   └── epicrisis.ts            # Lectura de documentos clínicos
│
├── db/
│   ├── schema.ts               # Esquema Drizzle (tablas, enums, tipos)
│   ├── migrate.ts              # Script de migración programática
│   └── migrations/             # Archivos SQL generados por Drizzle Kit
│
├── scripts/
│   └── seed.ts                 # Script para poblar la base de datos
│
├── src/                        # Aplicación Vue
│   ├── components/
│   │   ├── annotation/
│   │   │   ├── CriterionRow.vue    # Fila de criterio en el panel de anotación
│   │   │   └── MarkdownRenderer.vue # Renderizado del texto clínico
│   │   ├── ui/
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseLoader.vue
│   │   │   └── BaseModal.vue
│   │   └── EpicrisisCard.vue   # Tarjeta de epicrisis en el dashboard
│   │
│   ├── composables/
│   │   ├── useTextSelection.ts     # Captura de texto seleccionado
│   │   └── useAntiScreenCapture.ts # Detección de captura de pantalla
│   │
│   ├── constants/
│   │   └── criteria.ts         # Lista de 15 comorbilidades a anotar
│   │
│   ├── layouts/                # Layouts de página (auth / main)
│   ├── router/index.ts         # Configuración de rutas y guardias de navegación
│   ├── services/               # Capa de acceso a la API (fetch wrappers)
│   ├── stores/
│   │   ├── auth.ts             # Estado de autenticación (Pinia)
│   │   ├── epicrisis.ts        # Estado de epicrisis activa (Pinia)
│   │   └── annotation.ts       # Estado de anotación en curso (Pinia)
│   ├── types/                  # Tipos TypeScript compartidos
│   └── views/
│       ├── LoginView.vue       # Formulario de inicio de sesión
│       ├── DashboardView.vue   # Lista de epicrisis asignadas al anotador
│       ├── AnnotationView.vue  # Interfaz principal de anotación (split-pane)
│       └── AdminView.vue       # Panel de administración y asignación
│
├── .env.example                # Variables de entorno requeridas
├── drizzle.config.ts           # Configuración de Drizzle Kit
├── vercel.json                 # Configuración de despliegue en Vercel
├── vite.config.ts              # Configuración de Vite
└── package.json
```

---

## Modelo de Datos

### Tablas principales

#### `users`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | serial PK | Identificador único |
| `email` | text unique | Correo del usuario |
| `password_hash` | text | Contraseña hasheada con bcrypt |
| `role` | enum | `admin` o `annotator` |
| `created_at` | timestamp | Fecha de creación |

#### `epicrisis`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | serial PK | Identificador único |
| `content_markdown` | text | Texto clínico en Markdown |
| `llm_predictions` | json | Predicciones del LLM por criterio |
| `status` | enum | `pending`, `in_review`, `reviewed` |
| `assignee_id` | integer FK | Anotador asignado |
| `locked_by` | integer FK | Usuario que tiene abierto el documento |
| `locked_at` | timestamp | Timestamp del bloqueo |
| `created_at` | timestamp | Fecha de carga |

#### `annotations`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | serial PK | Identificador único |
| `epicrisis_id` | integer FK | Epicrisis anotada |
| `user_id` | integer FK | Anotador |
| `criterion_name` | text | Nombre de la comorbilidad |
| `is_present` | boolean nullable | Veredicto del anotador |
| `evidence_text` | text | Fragmento textual como evidencia |
| `comments` | text | Comentarios adicionales |
| `created_at` / `updated_at` | timestamp | Timestamps |

### Estados de una epicrisis

```
pending  ──►  in_review  ──►  reviewed
```

- **pending**: Asignada, aún no iniciada.
- **in_review**: El anotador ha guardado al menos un borrador.
- **reviewed**: Anotación final enviada (ground truth completo).

---

## Vistas de la Aplicación

### `LoginView`
Formulario de autenticación. Genera un JWT almacenado en cookie HTTP-only.

### `DashboardView`
Muestra al anotador la lista de epicrisis que tiene asignadas, con su estado de avance.

### `AnnotationView`
Interfaz central de la aplicación. Panel dividido:
- **Panel izquierdo**: Documento clínico en Markdown. Permite seleccionar texto para capturarlo como evidencia.
- **Panel derecho**: Lista de 15 comorbilidades. Para cada criterio, el anotador indica si está presente/ausente, adjunta evidencia y puede añadir comentarios. Muestra la predicción del LLM como referencia.

Funcionalidades destacadas:
- **Captura de evidencia**: Selecciona texto en el documento → clic en *Capturar evidencia* → el fragmento se inyecta en el criterio activo.
- **Autoguardado local**: Los borradores se persisten en `localStorage`.
- **Guardado en servidor**: Botón *Guardar borrador* sincroniza sin marcar como finalizado.
- **Envío final**: Requiere que todos los criterios estén marcados. Cambia el estado a `reviewed`.
- **Anti-captura de pantalla**: Detección experimental de capturas de pantalla del documento clínico.

### `AdminView`
Panel exclusivo para usuarios con rol `admin`:
- **Estadísticas globales**: Total, sin asignar, pendientes, en revisión, revisadas.
- **Tabla de epicrisis**: Filtrado por estado, visualización de progreso por anotador.
- **Asignación manual**: Selector por fila para cambiar el asignado.
- **Asignación rápida**: Distribuye automáticamente todas las epicrisis sin asignar entre los anotadores disponibles en orden rotativo.

---

## API Endpoints

Todas las rutas tienen el prefijo `/api/`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth` | Login (devuelve cookie JWT) |
| `GET` | `/api/auth` | Obtener usuario autenticado actual |
| `DELETE` | `/api/auth` | Logout (limpia la cookie) |
| `GET` | `/api/epicrisis` | Listar epicrisis del usuario autenticado |
| `GET` | `/api/epicrisis?id={n}` | Obtener una epicrisis por ID |
| `GET` | `/api/annotations?epicrisisId={n}` | Obtener anotaciones de una epicrisis |
| `POST` | `/api/annotations` | Guardar anotaciones (borrador o final) |
| `GET` | `/api/admin` | Panel: lista de epicrisis + estadísticas (admin) |
| `GET` | `/api/admin?users=1` | Lista de anotadores disponibles (admin) |
| `POST` | `/api/admin` | Asignar epicrisis a un usuario (admin) |

---

## Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```env
# Cadena de conexión a PostgreSQL (Neon)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Secreto para firmar los JWT (mínimo 32 caracteres)
JWT_SECRET=tu_secreto_muy_largo_y_aleatorio

# URL del frontend en producción (para CORS)
CORS_ORIGIN=https://tu-app.vercel.app
```

## Características Especiales de UX (Experiencia de Usuario)

### Virtual Highlighting (Selección Persistente)
La interfaz de anotación utiliza la **CSS Custom Highlight API** para proporcionar resaltado de texto persistente. Cuando un anotador selecciona texto en el documento clínico, este resaltado (amarillo estilo marcador) se mantiene anclado visualmente incluso si el usuario hace clic en los paneles laterales (perdiendo el foco de selección nativo del navegador). Esto reduce la carga cognitiva al evitar perder el contexto de lectura. El resaltado se destruye automáticamente al presionar el botón de capturar evidencia.

---

## Testing (End-to-End)

El proyecto utiliza **Playwright** para pruebas funcionales y visuales de extremo a extremo (E2E), garantizando que los flujos críticos para los anotadores no se rompan por accidente.

### Estrategia de Pruebas
1. **API Mocking**: Los tests inyectan respuestas falsas (Mocks) en los llamados al servidor (`/api/auth`, `/api/epicrisis`). Esto asegura que los tests se ejecuten de manera determinista y no muten ni dependan de la base de datos de producción.
2. **Eventos Nativos**: Playwright simula el movimiento del mouse y hace `dblclick()` real para validar que características como el Virtual Highlighting y la captura de texto respondan igual que con un usuario humano.

### Comandos de Testing

| Script | Descripción |
|--------|-------------|
| `npm run test:e2e` | Ejecuta la suite completa de Playwright en modo "silencioso" (Headless) |
| `npm run test:e2e:ui` | Abre el Panel de Control Interactivo de Playwright para depuración paso a paso |

*(Los reportes HTML generados se guardan en `playwright-report/` y están excluidos de Git).*

---

## Instalación y Desarrollo Local

### Prerrequisitos
- Node.js 20.x
- Una base de datos PostgreSQL (local o cualquier proveedor cloud)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd epicrisis_app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correctos

# 4. Aplicar el esquema a la base de datos
npm run db:push

# 5. Ejecutar en modo desarrollo (API + UI en paralelo)
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.  
La API corre en `http://localhost:3000/api/`.

### Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia API y UI en paralelo |
| `npm run dev:api` | Solo el servidor Express de desarrollo |
| `npm run dev:ui` | Solo el servidor Vite |
| `npm run build` | Compila TypeScript y genera el bundle de producción |
| `npm run db:push` | Sincroniza el esquema con la BD (sin migraciones) |
| `npm run db:generate` | Genera archivos de migración SQL |
| `npm run db:migrate` | Aplica migraciones pendientes |
| `npm run db:studio` | Abre Drizzle Studio (explorador visual de BD) |

---

## Despliegue en Vercel

El proyecto está configurado para desplegarse directamente en Vercel.

1. Importa el repositorio en Vercel.
2. Añade las variables de entorno en *Settings → Environment Variables*.
3. El comando de build configurado en `vercel.json` es:
   ```
   npm run db:migrate && npm run build
   ```
   Esto aplica las migraciones automáticamente en cada despliegue.

La carpeta `api/` es detectada automáticamente por Vercel como funciones serverless.  
El SPA (en `dist/`) se sirve con una regla de rewrite para soportar el ruteo del lado del cliente.

---

## Seguridad

- Las contraseñas se almacenan con hash **bcrypt**.
- La autenticación usa **JWT** firmados con `jose`, almacenados en cookies `HttpOnly; Secure; SameSite=Strict`.
- Los headers HTTP están configurados con CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- Las rutas de admin verifican el rol del token antes de ejecutar cualquier operación.

---

## Roles de Usuario

| Rol | Permisos |
|-----|---------|
| `annotator` | Ver y anotar las epicrisis que le fueron asignadas |
| `admin` | Todo lo anterior + ver todas las epicrisis, asignar anotadores, ver estadísticas globales |

---

## Flujo de Datos para Validación del LLM

```
Epicrisis (texto clínico)
        │
        ▼
  Predicción LLM ──────────────────────────────────┐
  (almacenada en llm_predictions JSON)              │
        │                                           │
        ▼                                           ▼
  Anotador humano lee el texto          Plataforma muestra predicción
  y clasifica cada comorbilidad         del LLM como referencia
        │
        ▼
  Anotación de Ground Truth
  (is_present + evidencia + comentarios)
        │
        ▼
  Comparación LLM vs. Human  →  Métricas de evaluación
```

El campo `llm_predictions` en la tabla `epicrisis` almacena un JSON estructurado con la predicción del modelo por cada criterio:

```json
{
  "Diabetes Mellitus": {
    "valor": true,
    "metodo": "reglas",
    "confianza": 0.92,
    "evidencia": "paciente diabético de larga data...",
    "conflicto": false,
    "requiere_llm": false
  }
}
```

---

## Contribución

1. Crea una rama desde `main`: `git checkout -b feature/mi-mejora`
2. Realiza tus cambios y asegúrate de que el proyecto compila: `npm run build`
3. Abre un Pull Request describiendo los cambios.

---

## Licencia

Este proyecto fue desarrollado con fines académicos e investigativos.
