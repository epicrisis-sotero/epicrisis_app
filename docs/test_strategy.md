# Estrategia de Tests — Backend Epicrisis

## Stack de testing
- **Vitest** — nativo ESM + TypeScript, sin configuración extra para `"type": "module"` con `NodeNext`. Jest requiere `--experimental-vm-modules` y mapeo de extensiones `.js`, Vitest no.
- **supertest** — hace requests HTTP reales contra el Express `app` sin bindear un puerto.
- **Base de datos real** `epicrisis_test` en PostgreSQL local — la lógica usa `pgEnum`, `json_object_agg` y `bytea`, sin sustituto viable en SQLite.

## Paquetes a instalar (devDependencies)
```
vitest  supertest  @types/supertest
```

---

## Refactor previo necesario: extraer `server/app.ts`

`server/index.ts` llama `app.listen()` al importarse, lo que rompe los tests (no se puede importar sin arrancar un servidor). Separar en:

- **`server/app.ts`** — exporta `app` (Express configurado con CORS, rutas y PDF handler) sin llamar `.listen()`
- **`server/index.ts`** — importa `app` y llama `.listen(PORT)`

Sin cambio de comportamiento en producción.

---

## Estructura de archivos

```
vitest.config.ts
.env.test                        ← apunta a epicrisis_test (agregar a .gitignore)
server/
  app.ts                         ← NUEVO: Express app sin listen()
  index.ts                       ← MODIFICADO: solo importa app + listen()
tests/
  setup/
    globalSetup.ts               ← migra epicrisis_test una vez al inicio del run
    fixtures.ts                  ← insertUser(), insertEpicrisis(), cleanup*()
    helpers.ts                   ← makeToken(), authHeader()
  auth.test.ts
  epicrisis.test.ts
  annotations.test.ts
  lock.test.ts
  admin.test.ts
```

### `vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./tests/setup/globalSetup.ts'],
    testTimeout: 15000,
    pool: 'forks',
    sequence: { concurrent: false }, // archivos secuenciales → sin conflictos de FK en DB
  },
})
```

### `tests/setup/globalSetup.ts`
- Carga `.env.test` via `dotenv.config({ path: '.env.test' })`
- Corre `drizzle-orm/node-postgres/migrator` contra `epicrisis_test` (idempotente)
- Si la DB no existe, lanza error descriptivo

### `tests/setup/helpers.ts`
```ts
import { signToken, type TokenPayload } from '../../api/_lib/auth.js'
export const makeToken = (p: TokenPayload) => signToken(p)
export const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` })
```

### `tests/setup/fixtures.ts`
Inserción directa via Drizzle (no HTTP). Funciones:
- `insertUser({ email, role })` → hashea `'password123'`, devuelve fila
- `insertEpicrisis({ patientId?, status?, assigneeId? })` → devuelve fila
- `insertSection(epicrisisId, { sectionName, label, content, position })`
- `insertAnnotation({ epicrisisId, userId, criterionName, isPresent })`
- `cleanupUsers(emails[])`, `cleanupEpicrises(ids[])` → DELETE ordenado por FK

### Scripts en `package.json`
```json
"test": "vitest run",
"test:watch": "vitest"
```

---

## Casos de test

### `tests/auth.test.ts` — 7 casos

**beforeAll**: insertar un usuario admin (`auth-admin@test.com`) y uno annotator (`auth-annotator@test.com`) con password `password123`.  
**afterAll**: eliminar ambos usuarios.

| # | Request | Esperado |
|---|---|---|
| 1 | POST /api/auth credenciales válidas | 200, `Set-Cookie` contiene `auth_token=` |
| 2 | POST /api/auth contraseña incorrecta | 401 |
| 3 | POST /api/auth body `{ email: 'no-email', password: 'x' }` | 400 con `details` |
| 4 | GET /api/auth con Bearer token válido | 200, body tiene `user.email` |
| 5 | GET /api/auth sin token | 401 |
| 6 | DELETE /api/auth | 200, `Set-Cookie` contiene `Max-Age=0` |
| 7 | PATCH /api/auth (aceptar términos) | 200, `user.termsAcceptedAt` es fecha válida |

---

### `tests/epicrisis.test.ts` — 7 casos

**beforeAll**: admin + annotator1 + annotator2. Epicrisis A (→ annotator1), B (→ annotator2), C (sin asignar). Secciones de A con posiciones desordenadas `[2, 0, 1]`. `epicrisisClinicalData` para A.  
**afterAll**: cleanup en orden FK.

| # | Request | Esperado |
|---|---|---|
| 8 | GET /api/epicrisis sin auth | 401 |
| 9 | GET /api/epicrisis con annotator1Token | Solo epicrisis A en la lista |
| 10 | GET /api/epicrisis?id=B con adminToken | 200, `epicrisis.id === B.id` |
| 11 | GET /api/epicrisis?id=B con annotator1Token | 404 (no es su asignado) |
| 12 | GET /api/epicrisis?id=abc | 400 |
| 13 | GET /api/epicrisis?id=A → sections | Ordenadas por `position`: `[0, 1, 2]` |
| 14 | GET /api/epicrisis?id=A → clinicalData | `clinicalData !== null` |

---

### `tests/annotations.test.ts` — 5 casos

**beforeAll**: annotator1 (asignado a epicrisis A, status `pending`), annotator2 (no asignado). 2 anotaciones previas en la DB.  
**afterAll**: cleanup en orden FK.

| # | Request | Esperado |
|---|---|---|
| 15 | GET /api/annotations?epicrisisId=A | 200, array de 2 anotaciones |
| 16 | POST save `isFinal: false` con annotator1 | 200, `{ ok: true, status: 'in_review' }`, DB actualizada |
| 17 | POST save `isFinal: true` con annotator1 | 200, `{ ok: true, status: 'reviewed' }`, DB actualizada |
| 18 | POST save con annotator2 (no asignado) | 403 |
| 19 | POST 3 criteria, luego POST 1 criterion, GET → | `annotations.length === 1` (nuclear replace) |

---

### `tests/lock.test.ts` — 6 casos

**beforeAll**: user1, user2, epicrisis sin lock.  
**afterAll**: cleanup.  
**Nota**: El timeout de lock es `LOCK_TIMEOUT_MINUTES = 5` (definido en `api/lock.ts:7`). El test 23 manipula `lockedAt` directamente en la DB para simular expiración.

| # | Request | Esperado |
|---|---|---|
| 20 | POST lock con user1 | 200, DB `lockedBy === user1.id` |
| 21 | POST lock de nuevo con user1 (renovar) | 200, `lockedAt` actualizado |
| 22 | POST lock con user2 (user1 tiene lock activo) | 423, body tiene campo `lockedBy` |
| 23 | Set `lockedAt = hace 6 min` en DB, POST lock con user2 | 200 (lock expirado, user2 toma el lock) |
| 24 | POST unlock con user1 (dueño) | 200, DB `lockedBy === null` |
| 25 | POST unlock con user2 (no dueño, no admin) | 200 pero DB `lockedBy` no cambia _(documenta comportamiento actual_) |

---

### `tests/admin.test.ts` — 11 casos

**beforeAll**: admin, annotator1, annotator2. Epicrisis: una `pending`, una `in_review`, una `reviewed`.  
**afterAll**: cleanup.

| # | Request | Esperado |
|---|---|---|
| 26 | GET /api/admin con annotatorToken | 403 |
| 27 | GET /api/admin?resource=users con adminToken | Solo roles `annotator` en el array |
| 28 | GET /api/admin?resource=matrix | Array, cada fila tiene campo `annotations` |
| 29 | POST `{ action: 'createUser', email: 'new@test.com', ... }` | 201, body tiene `user.id` |
| 30 | POST createUser mismo email | 409 |
| 31 | POST `{ action: 'updateRole', userId: annotator1.id, role: 'admin' }` | 200 |
| 32 | POST updateRole sobre sí mismo (admin) | 403 |
| 33 | POST `{ action: 'deleteUser', userId: annotator2.id }` | 200, usuario eliminado de DB |
| 34 | POST deleteUser sobre sí mismo (admin) | 403 |
| 35 | PATCH `{ epicrisisId: pending.id, userId: annotator1.id }` | 200, DB `assigneeId === annotator1.id` |
| 36 | PATCH assign sobre epicrisis `reviewed` | 409 |

---

## Orden de implementación

1. `createdb epicrisis_test`
2. `npm install -D vitest supertest @types/supertest`
3. Extraer `server/app.ts` (refactor sin cambio de comportamiento)
4. Crear `vitest.config.ts`, `.env.test`, `tests/setup/`
5. Implementar test files en orden: `auth` → `epicrisis` → `annotations` → `lock` → `admin`
6. `npm test` — todos en verde
