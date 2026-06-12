# Bot de Telegram — Epicrisis Backend

**Fecha de implementación:** 2026-06-05  
**Hora:** ~15:50–16:20 (America/Santiago)  
**Bot:** [@Epicrisisuci_bot](https://t.me/Epicrisisuci_bot)

---

## Motivación

El backend de Epicrisis corre localmente en el computador del desarrollador y se expone al mundo mediante un túnel VPS. Esto implica que para saber si el servidor está activo, reiniciarlo o revisar el progreso de las anotaciones, era necesario estar frente al computador.

El bot permite hacer todo eso desde el teléfono vía Telegram.

---

## Arquitectura

El bot corre como un **proceso separado** de `epicrisis-api` dentro de PM2. Esta separación es intencional: si el backend cae o necesita ser reiniciado, el bot sigue activo y puede levantarlo.

```
PM2
├── epicrisis-api    → Express server (puerto 3001)
├── epicrisis-bot    → Telegram bot (este proceso)
└── ngrok-tunnel     → Túnel VPS
```

El bot controla `epicrisis-api` ejecutando comandos PM2 via `child_process.exec`, y consulta la base de datos directamente usando la misma conexión Drizzle/PostgreSQL del backend.

---

## Archivos creados o modificados

| Archivo | Cambio |
|---|---|
| `bot/index.ts` | Bot completo (nuevo) |
| `ecosystem.config.cjs` | Agregado proceso `epicrisis-bot` |
| `package.json` | Agregados scripts `bot` y `bot:once` |
| `.env` | Agregadas 4 variables de entorno |

### Variables de entorno agregadas a `.env`

```env
TELEGRAM_BOT_TOKEN="<token del BotFather>"
TELEGRAM_USER_IDS="623314250"       # IDs autorizados (separados por coma)
REPORT_CRON="0 8,20 * * *"          # Reportes a las 8:00 y 20:00 (hora Chile)
REPORT_TIMEZONE="America/Santiago"
BOT_PASSWORD="epicrisis2026"         # Clave de acceso al bot
SESSION_HOURS="24"                   # Duración de sesión tras login
```

### Scripts nuevos en `package.json`

```json
"bot":      "tsx watch bot/index.ts"   // usado por PM2 (con hot-reload)
"bot:once": "tsx bot/index.ts"         // para pruebas manuales
```

### Entrada nueva en `ecosystem.config.cjs`

```js
{
  name: 'epicrisis-bot',
  script: 'npm',
  args: 'run bot',
  cwd: '/Users/fabianortega/src/epicrisis_backend',
  autorestart: true,
  max_restarts: 10,
  restart_delay: 5000,
  out_file: '/Users/fabianortega/.pm2/logs/epicrisis-bot-out.log',
  error_file: '/Users/fabianortega/.pm2/logs/epicrisis-bot-error.log',
}
```

---

## Dependencias instaladas

```bash
npm install grammy          # Framework Telegram (TypeScript-first)
npm install node-cron       # Scheduler para reportes automáticos
npm install --save-dev @types/node-cron
```

---

## Seguridad — dos capas

### Capa 1: Whitelist de user IDs

Solo los Telegram user IDs listados en `TELEGRAM_USER_IDS` pueden interactuar con el bot. Cualquier otro mensaje recibe `⛔ No autorizado` sin más información.

Para agregar un colega: añadir su ID a la variable separado por coma:
```env
TELEGRAM_USER_IDS="623314250,ID_COLEGA"
```

### Capa 2: Contraseña de sesión

Si `BOT_PASSWORD` está definido en `.env`, todos los usuarios de la whitelist deben autenticarse con `/login <clave>` antes de usar cualquier comando. La sesión dura `SESSION_HOURS` horas (default 24).

Si `BOT_PASSWORD` está vacío o no definido, la capa de contraseña se desactiva y solo opera la whitelist.

---

## Comandos del bot

### Sesión

| Comando | Descripción |
|---|---|
| `/login <clave>` | Inicia sesión. Requerido una vez cada `SESSION_HOURS` horas. |
| `/logout` | Cierra la sesión activa. |
| `/session` | Muestra cuánto tiempo queda en la sesión actual. |

### Control del servidor

| Comando | Descripción |
|---|---|
| `/status` | Muestra estado PM2 (online/stopped), ping HTTP, uptime, RAM, CPU y reinicios. |
| `/on` | Inicia el proceso `epicrisis-api` via PM2. Si ya está corriendo, lo indica. |
| `/off` | Detiene el proceso. Pide confirmación inline antes de ejecutar. |
| `/restart` | Reinicia el proceso y verifica que HTTP responda. |

### Diagnóstico

| Comando | Descripción |
|---|---|
| `/logs [n]` | Últimas N líneas del log de salida (default 30, max 80). |
| `/errors [n]` | Últimas N líneas del log de errores (default 30, max 80). |

Lee directamente los archivos `.pm2/logs/epicrisis-api-out.log` y `epicrisis-api-error.log`.

### Datos / Epicrisis

| Comando | Descripción |
|---|---|
| `/report` | Reporte completo: estado del servidor + conteo de epicrisis por estado + barra de progreso. |
| `/progress` | Progreso detallado por anotador: barra visual + porcentaje + fracción completada. |

### Reportes automáticos

| Comando | Descripción |
|---|---|
| `/schedule` | Muestra el cron actual, horarios legibles y si está silenciado. |
| `/schedule <expr>` | Cambia el horario. Ejemplo: `/schedule 0 8,14,20 * * *` para 3 reportes al día. |
| `/mute [horas]` | Silencia reportes automáticos por N horas (default 8). Los manuales siguen funcionando. |
| `/unmute` | Reactiva los reportes automáticos. |

---

## Reportes automáticos — detalles

El scheduler usa `node-cron` corriendo dentro del proceso del bot. Por defecto envía un reporte a las **8:00 y 20:00** hora Chile.

El reporte automático incluye:
- Estado del servidor (PM2 + HTTP ping + uptime + RAM + reinicios)
- Conteo de epicrisis por estado (revisadas / en revisión / pendientes)
- Barra de progreso global
- Progreso por anotador

**Para cambiar el horario desde Telegram:**
```
/schedule 0 8,14,20 * * *   → 8:00, 14:00, 20:00
/schedule 0 */6 * * *       → cada 6 horas
/schedule 0 9 * * 1-5       → solo días hábiles a las 9:00
```

El horario se guarda en memoria: si el bot se reinicia, vuelve al valor de `REPORT_CRON` en `.env`. Para persistir un cambio, editar `.env` y reiniciar con `pm2 restart epicrisis-bot --update-env`.

---

## Operaciones de mantenimiento

### Ver logs del bot
```bash
pm2 logs epicrisis-bot --lines 30
tail -f /Users/fabianortega/.pm2/logs/epicrisis-bot-out.log
tail -f /Users/fabianortega/.pm2/logs/epicrisis-bot-error.log
```

### Reiniciar bot (y recargar .env)
```bash
pm2 restart epicrisis-bot --update-env
```

### Iniciar/detener todo
```bash
pm2 start ecosystem.config.cjs    # inicia api + bot
pm2 stop all
pm2 restart all
```

### Cambiar la contraseña del bot
1. Editar `BOT_PASSWORD` en `.env`
2. `pm2 restart epicrisis-bot --update-env`
3. Las sesiones activas previas expiran automáticamente en su hora programada.

---

## Flujo de autenticación (diagrama)

```
Usuario envía mensaje
        │
        ▼
  ¿ID en whitelist?  ─── No ──→  "⛔ No autorizado"
        │ Sí
        ▼
  ¿Comando /login o /start?  ─── Sí ──→  procesar sin verificar sesión
        │ No
        ▼
  ¿BOT_PASSWORD definido?  ─── No ──→  acceso libre (solo whitelist)
        │ Sí
        ▼
  ¿Sesión activa y no expirada?  ─── No ──→  "🔐 Usa /login <clave>"
        │ Sí
        ▼
     Ejecutar comando
```
