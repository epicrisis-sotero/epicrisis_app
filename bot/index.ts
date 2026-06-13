import 'dotenv/config'
import { Bot, InlineKeyboard } from 'grammy'
import { exec } from 'child_process'
import { promisify } from 'util'
import cron from 'node-cron'
import { db, epicrisis, users, epicrisisAssignments } from '../db/index.js'
import { eq, count, sql } from 'drizzle-orm'

const execAsync = promisify(exec)

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN no definido en .env')

const ALLOWED_IDS = (process.env.TELEGRAM_USER_IDS || '')
  .split(',')
  .map(id => parseInt(id.trim()))
  .filter(id => !isNaN(id))

// Chat al que se envían los reportes automáticos (primer ID de la lista)
const REPORT_CHAT_ID = ALLOWED_IDS[0]

const API_URL = `http://localhost:${process.env.PORT || 3001}`
const NGROK_URL = process.env.NGROK_URL?.replace(/\/$/, '') || ''
const PM2_OUT_LOG = '/Users/fabianortega/.pm2/logs/epicrisis-api-out.log'
const PM2_ERR_LOG = '/Users/fabianortega/.pm2/logs/epicrisis-api-error.log'
const TZ = process.env.REPORT_TIMEZONE || 'America/Santiago'

const BOT_PASSWORD = process.env.BOT_PASSWORD ?? ''
const BOT_ADMIN_PASSWORD = process.env.BOT_ADMIN_PASSWORD ?? ''
const SESSION_HOURS = parseInt(process.env.SESSION_HOURS || '24') || 24

// userId → fecha de expiración (sesiones temporales)
const sessions = new Map<number, Date>()
// userId → sesión permanente (admin)
const adminSessions = new Set<number>()

function isAuthenticated(userId: number): boolean {
  if (!BOT_PASSWORD) return true  // sin contraseña configurada, acceso libre
  if (adminSessions.has(userId)) return true
  const exp = sessions.get(userId)
  return !!exp && exp > new Date()
}

function isAdmin(userId: number): boolean {
  return adminSessions.has(userId)
}

// Estado mutable del scheduler
let muteUntil: Date | null = null
let cronExpression = process.env.REPORT_CRON || '0 8,20 * * *'
let scheduledTask: cron.ScheduledTask | null = null

const bot = new Bot(BOT_TOKEN)

// ─── Auth middleware ──────────────────────────────────────────────────────────
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id
  if (!userId || !ALLOWED_IDS.includes(userId)) {
    await ctx.reply('⛔ No autorizado')
    return
  }

  // Permitir /login y /start sin sesión activa
  const command = ctx.message?.text?.split(' ')[0]?.replace('/', '')
  if (command === 'login' || command === 'start') {
    await next()
    return
  }

  if (!isAuthenticated(userId)) {
    await ctx.reply('🔐 Sesión no iniciada. Usa /login <clave> para acceder.')
    return
  }

  await next()
})

// ─── PM2 helpers ─────────────────────────────────────────────────────────────
async function getPm2Process() {
  try {
    const { stdout } = await execAsync('pm2 jlist')
    const list = JSON.parse(stdout) as any[]
    return list.find(p => p.name === 'epicrisis-api') ?? null
  } catch {
    return null
  }
}

async function pm2Cmd(args: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(`pm2 ${args}`)
    return (stdout + stderr).trim()
  } catch (err: any) {
    return err.message ?? 'Error desconocido'
  }
}

async function pingBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/epicrisis`, {
      signal: AbortSignal.timeout(3000),
    })
    return res.status < 500
  } catch {
    return false
  }
}

// Estado del túnel ngrok visto DESDE INTERNET (como lo ve el frontend en Vercel).
// PM2 puede reportar el túnel "online" siendo un zombie, por eso verificamos
// el dominio público y distinguimos la respuesta de la app vs la página de error de ngrok.
type TunnelStatus = 'up' | 'offline' | 'unreachable' | 'unconfigured'

async function pingTunnel(): Promise<TunnelStatus> {
  if (!NGROK_URL) return 'unconfigured'
  try {
    const res = await fetch(`${NGROK_URL}/api/epicrisis`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      signal: AbortSignal.timeout(6000),
    })
    // ngrok añade este header cuando su edge no encuentra un agente conectado
    if (res.headers.get('ngrok-error-code')) return 'offline'
    // nuestra API siempre responde JSON; la página de error de ngrok es HTML
    const contentType = res.headers.get('content-type') || ''
    return contentType.includes('application/json') ? 'up' : 'offline'
  } catch {
    return 'unreachable'
  }
}

function tunnelLine(status: TunnelStatus): string {
  switch (status) {
    case 'up':
      return '🟢 *Túnel:* activo (accesible desde internet)'
    case 'offline':
      return '🔴 *Túnel:* caído — ngrok sin agente conectado'
    case 'unreachable':
      return '🔴 *Túnel:* inalcanzable — ngrok no responde'
    case 'unconfigured':
      return '⚪ *Túnel:* no configurado (define NGROK_URL en .env)'
  }
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ${h % 24}h`
  if (h > 0) return `${h}h ${m % 60}m`
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function formatMem(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function buildBar(pct: number, len = 10): string {
  const filled = Math.round((pct / 100) * len)
  return '█'.repeat(filled) + '░'.repeat(len - filled)
}

// ─── Contenido del reporte combinado (status + datos) ────────────────────────
async function buildFullReport(label = '📋'): Promise<string> {
  const now = new Date().toLocaleString('es-CL', { timeZone: TZ })

  // Estado del servidor
  const [proc, alive, tunnel] = await Promise.all([getPm2Process(), pingBackend(), pingTunnel()])
  let serverLine: string
  if (!proc) {
    serverLine = `🔴 API: proceso no encontrado | HTTP: ${alive ? '✅' : '❌'}\n${tunnelLine(tunnel)}`
  } else {
    const st = proc.pm2_env?.status ?? 'unknown'
    const icon = st === 'online' ? '🟢' : st === 'stopped' ? '🔴' : '🟡'
    const uptimeMs = proc.pm2_env?.pm_uptime ? Date.now() - proc.pm2_env.pm_uptime : 0
    const mem = proc.monit?.memory ?? 0
    const restarts = proc.pm2_env?.restart_time ?? 0
    serverLine =
      `${icon} API: ${st} | HTTP: ${alive ? '✅' : '❌'}\n` +
      `${tunnelLine(tunnel)}\n` +
      `⏱ Uptime: ${st === 'online' ? formatUptime(uptimeMs) : '—'} | 💾 ${formatMem(mem)} | 🔄 ${restarts} reinicios`
  }

  // Stats epicrisis
  const statusStats = await db
    .select({ status: epicrisis.status, total: count() })
    .from(epicrisis)
    .groupBy(epicrisis.status)

  const total = statusStats.reduce((s, r) => s + r.total, 0)
  const reviewed = statusStats.find(r => r.status === 'reviewed')?.total ?? 0
  const inReview = statusStats.find(r => r.status === 'in_review')?.total ?? 0
  const pending = statusStats.find(r => r.status === 'pending')?.total ?? 0
  const expertReview = statusStats.find(r => r.status === 'needs_expert_review')?.total ?? 0
  const pct = total > 0 ? Math.round((reviewed / total) * 100) : 0

  // Progreso por anotador
  const annotators = await db
    .select({
      email: users.email,
      completed: sql<number>`cast(count(case when ${epicrisisAssignments.completedAt} is not null then 1 end) as int)`,
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(epicrisisAssignments)
    .innerJoin(users, eq(epicrisisAssignments.userId, users.id))
    .groupBy(users.id, users.email)

  let annotatorLines = ''
  for (const r of annotators) {
    const name = r.email.split('@')[0]
    const p = r.total > 0 ? Math.round((Number(r.completed) / Number(r.total)) * 100) : 0
    annotatorLines += `  👤 ${name}: ${buildBar(p, 8)} ${p}% (${r.completed}/${r.total})\n`
  }

  return (
    `${label} *Reporte automático*\n_${now}_\n\n` +
    `*Servidor*\n${serverLine}\n\n` +
    `*Epicrisis* — ${buildBar(pct)} *${pct}%*\n` +
    `✅ ${reviewed} revisadas · 🔄 ${inReview} en revisión · ⏳ ${pending} pendientes · 📋 ${total} total\n` +
    (expertReview > 0 ? `⚠️ ${expertReview} requiere${expertReview > 1 ? 'n' : ''} revisión experta\n` : '') +
    `\n` +
    (annotatorLines ? `*Por anotador*\n${annotatorLines}` : '')
  )
}

// ─── Scheduler ───────────────────────────────────────────────────────────────
function describeSchedule(expr: string): string {
  // Descripción legible de los horarios más comunes
  const hourMatch = expr.match(/^0 ([\d,]+) \* \* \*$/)
  if (hourMatch) {
    const hours = hourMatch[1].split(',').map(h => `${h}:00`)
    return hours.join(', ')
  }
  return expr
}

function startScheduler() {
  scheduledTask?.stop()
  scheduledTask = cron.schedule(
    cronExpression,
    async () => {
      if (muteUntil && new Date() < muteUntil) return
      try {
        const text = await buildFullReport('🔔')
        await bot.api.sendMessage(REPORT_CHAT_ID, text, { parse_mode: 'Markdown' })
      } catch (err) {
        console.error('[Scheduler] Error enviando reporte:', err)
      }
    },
    { timezone: TZ }
  )
  console.log(`[Scheduler] Programado: "${cronExpression}" (${TZ})`)
}

// ─── Comandos ────────────────────────────────────────────────────────────────

const HELP_TEXT = `🏥 *Epicrisis Backend Bot*

━━━━━━━━━━━━━━━━
🔐 *Sesión*
━━━━━━━━━━━━━━━━
/login \`<clave>\` — Iniciar sesión \\(normal: expira en ${SESSION_HOURS}h / admin: permanente\\)
/logout — Cerrar sesión activa
/session — Ver estado y tiempo restante de sesión

━━━━━━━━━━━━━━━━
⚙️ *Control del servidor*
━━━━━━━━━━━━━━━━
/on — Encender el backend \\(epicrisis\\-api via PM2\\)
/off — Apagar el backend \\(pide confirmación\\)
/restart — Reiniciar y verificar respuesta HTTP
/status — Estado PM2 · HTTP · túnel ngrok · uptime · RAM · CPU · reinicios

━━━━━━━━━━━━━━━━
🔍 *Diagnóstico*
━━━━━━━━━━━━━━━━
/logs — Últimas 30 líneas del log de salida
/logs \`50\` — Últimas N líneas \\(máx 80\\)
/errors — Últimas 30 líneas del log de errores
/errors \`20\` — Últimas N líneas de errores \\(máx 80\\)

━━━━━━━━━━━━━━━━
📊 *Datos y progreso*
━━━━━━━━━━━━━━━━
/report — Reporte completo: servidor \\+ epicrisis \\+ anotadores
/progress — Progreso detallado por anotador con barra visual

━━━━━━━━━━━━━━━━
🔔 *Reportes automáticos*
━━━━━━━━━━━━━━━━
/schedule — Ver horario actual y si está silenciado
/schedule \`0 8,20 * * *\` — Cambiar horario \\(expresión cron\\)
/mute — Silenciar reportes 8 horas
/mute \`4\` — Silenciar N horas
/unmute — Reactivar reportes automáticos

━━━━━━━━━━━━━━━━
/help — Mostrar este menú`

// Lista de comandos registrados en Telegram (activa el autocompletado con /)
const BOT_COMMANDS = [
  { command: 'status',   description: 'Estado del servidor: PM2, HTTP, túnel ngrok, uptime, RAM, CPU' },
  { command: 'on',       description: 'Encender el backend' },
  { command: 'off',      description: 'Apagar el backend (pide confirmación)' },
  { command: 'restart',  description: 'Reiniciar el backend' },
  { command: 'report',   description: 'Reporte completo: servidor + epicrisis + anotadores' },
  { command: 'progress', description: 'Progreso por anotador con barra visual' },
  { command: 'logs',     description: 'Últimas líneas del log. Ej: /logs 50' },
  { command: 'errors',   description: 'Últimas líneas del log de errores. Ej: /errors 20' },
  { command: 'schedule', description: 'Ver o cambiar horario de reportes automáticos' },
  { command: 'mute',     description: 'Silenciar reportes N horas. Ej: /mute 4' },
  { command: 'unmute',   description: 'Reactivar reportes automáticos' },
  { command: 'login',    description: 'Iniciar sesión con clave' },
  { command: 'logout',   description: 'Cerrar sesión activa' },
  { command: 'session',  description: 'Ver estado y tiempo restante de sesión' },
  { command: 'help',     description: 'Mostrar todos los comandos disponibles' },
]

bot.command(['start', 'help'], ctx => ctx.reply(HELP_TEXT, { parse_mode: 'Markdown' }))

// ── /login ────────────────────────────────────────────────────────────────────
bot.command('login', async ctx => {
  if (!BOT_PASSWORD) {
    await ctx.reply('ℹ️ Este bot no tiene contraseña configurada.')
    return
  }

  const userId = ctx.from!.id
  const input = ctx.match?.trim()

  if (!input) {
    await ctx.reply('🔐 Ingresa tu clave: /login <clave>')
    return
  }

  // Clave de admin → sesión permanente
  if (BOT_ADMIN_PASSWORD && input === BOT_ADMIN_PASSWORD) {
    adminSessions.add(userId)
    sessions.delete(userId)
    console.log(`[Auth] Login ADMIN — user ${userId}, sesión permanente`)
    await ctx.reply(
      `✅ Acceso de *administrador* concedido.\n🔓 Sesión permanente — no expira.\n\nUsa /help para ver los comandos disponibles.`,
      { parse_mode: 'Markdown' }
    )
    return
  }

  // Clave normal → sesión temporal
  if (input !== BOT_PASSWORD) {
    console.warn(`[Auth] Intento fallido de login — user ${userId}`)
    await ctx.reply('❌ Clave incorrecta.')
    return
  }

  adminSessions.delete(userId)
  const expires = new Date(Date.now() + SESSION_HOURS * 3600 * 1000)
  sessions.set(userId, expires)
  const expStr = expires.toLocaleString('es-CL', { timeZone: TZ })
  console.log(`[Auth] Login exitoso — user ${userId}, sesión hasta ${expStr}`)
  await ctx.reply(
    `✅ Acceso concedido. Sesión activa por *${SESSION_HOURS} horas* (hasta ${expStr}).\n\nUsa /help para ver los comandos disponibles.`,
    { parse_mode: 'Markdown' }
  )
})

// ── /logout ───────────────────────────────────────────────────────────────────
bot.command('logout', async ctx => {
  const userId = ctx.from!.id
  adminSessions.delete(userId)
  sessions.delete(userId)
  await ctx.reply('👋 Sesión cerrada.')
})

// ── /session ──────────────────────────────────────────────────────────────────
bot.command('session', async ctx => {
  if (!BOT_PASSWORD) {
    await ctx.reply('ℹ️ Autenticación no habilitada.')
    return
  }
  const userId = ctx.from!.id

  if (isAdmin(userId)) {
    await ctx.reply('👑 Sesión de *administrador* — permanente, no expira.', { parse_mode: 'Markdown' })
    return
  }

  const exp = sessions.get(userId)
  if (!exp || exp <= new Date()) {
    await ctx.reply('🔐 Sin sesión activa. Usa /login <clave>')
    return
  }
  const remaining = Math.round((exp.getTime() - Date.now()) / 3600000)
  const expStr = exp.toLocaleString('es-CL', { timeZone: TZ })
  await ctx.reply(`✅ Sesión activa — expira en ~${remaining}h (${expStr}).`)
})

// ── /status ───────────────────────────────────────────────────────────────────
bot.command('status', async ctx => {
  const msg = await ctx.reply('⏳ Consultando...')
  const [proc, alive, tunnel] = await Promise.all([getPm2Process(), pingBackend(), pingTunnel()])

  let text: string
  if (!proc) {
    text = `🔴 *PM2:* proceso no encontrado\n${alive ? '✅' : '❌'} *HTTP:* ${alive ? 'OK' : 'sin respuesta'}\n${tunnelLine(tunnel)}`
  } else {
    const st = proc.pm2_env?.status ?? 'unknown'
    const stIcon = st === 'online' ? '🟢' : st === 'stopped' ? '🔴' : '🟡'
    const uptimeMs = proc.pm2_env?.pm_uptime ? Date.now() - proc.pm2_env.pm_uptime : 0
    const mem = proc.monit?.memory ?? 0
    const cpu = proc.monit?.cpu ?? 0
    const restarts = proc.pm2_env?.restart_time ?? 0
    text =
      `${stIcon} *PM2:* ${st}\n` +
      `${alive ? '✅' : '❌'} *HTTP:* ${alive ? 'OK' : 'sin respuesta'}\n` +
      `${tunnelLine(tunnel)}\n` +
      `⏱ *Uptime:* ${st === 'online' ? formatUptime(uptimeMs) : '—'}\n` +
      `💾 *Memoria:* ${formatMem(mem)}\n` +
      `⚡ *CPU:* ${cpu}%\n` +
      `🔄 *Reinicios:* ${restarts}`
  }

  await ctx.api.editMessageText(ctx.chat.id, msg.message_id, text, { parse_mode: 'Markdown' })
})

// ── /on ───────────────────────────────────────────────────────────────────────
bot.command('on', async ctx => {
  const msg = await ctx.reply('⏳ Iniciando backend...')
  const proc = await getPm2Process()
  if (proc?.pm2_env?.status === 'online') {
    await ctx.api.editMessageText(ctx.chat.id, msg.message_id, '✅ El backend ya está corriendo.')
    return
  }
  await pm2Cmd('start /Users/fabianortega/src/epicrisis_backend/ecosystem.config.cjs --only epicrisis-api')
  await new Promise(r => setTimeout(r, 3000))
  const alive = await pingBackend()
  const text = alive
    ? '✅ Backend iniciado y respondiendo correctamente.'
    : '⚠️ PM2 ejecutado, pero el HTTP aún no responde. Espera unos segundos y usa /status.'
  await ctx.api.editMessageText(ctx.chat.id, msg.message_id, text)
})

// ── /off ──────────────────────────────────────────────────────────────────────
bot.command('off', async ctx => {
  const kb = new InlineKeyboard()
    .text('✅ Sí, apagar', 'confirm_off')
    .text('❌ Cancelar', 'cancel_off')
  await ctx.reply('⚠️ ¿Confirmas que quieres *apagar* el backend?', {
    parse_mode: 'Markdown',
    reply_markup: kb,
  })
})

bot.callbackQuery('confirm_off', async ctx => {
  await ctx.editMessageText('⏳ Apagando...')
  await pm2Cmd('stop epicrisis-api')
  await ctx.editMessageText('🔴 Backend detenido.')
  await ctx.answerCallbackQuery()
})

bot.callbackQuery('cancel_off', async ctx => {
  await ctx.editMessageText('OK, operación cancelada.')
  await ctx.answerCallbackQuery()
})

// ── /restart ──────────────────────────────────────────────────────────────────
bot.command('restart', async ctx => {
  const msg = await ctx.reply('⏳ Reiniciando...')
  await pm2Cmd('restart epicrisis-api')
  await new Promise(r => setTimeout(r, 4000))
  const alive = await pingBackend()
  const text = alive
    ? '✅ Backend reiniciado y respondiendo.'
    : '⚠️ Reiniciado, pero HTTP sin respuesta aún. Usa /status en unos segundos.'
  await ctx.api.editMessageText(ctx.chat.id, msg.message_id, text)
})

// ── /logs ─────────────────────────────────────────────────────────────────────
bot.command('logs', async ctx => {
  const n = Math.min(parseInt(ctx.match || '30') || 30, 80)
  const msg = await ctx.reply(`⏳ Obteniendo últimas ${n} líneas...`)
  let text: string
  try {
    const { stdout } = await execAsync(`tail -n ${n} "${PM2_OUT_LOG}"`)
    const clean = stdout.replace(/\x1B\[[0-9;]*m/g, '').trim()
    text = `\`\`\`\n${clean.slice(-3800) || '(vacío)'}\n\`\`\``
  } catch {
    text = '❌ No se pudo leer el archivo de log.'
  }
  await ctx.api.editMessageText(ctx.chat.id, msg.message_id, text, { parse_mode: 'Markdown' })
})

// ── /errors ───────────────────────────────────────────────────────────────────
bot.command('errors', async ctx => {
  const n = Math.min(parseInt(ctx.match || '30') || 30, 80)
  const msg = await ctx.reply(`⏳ Obteniendo últimas ${n} líneas de errores...`)
  let text: string
  try {
    const { stdout } = await execAsync(`tail -n ${n} "${PM2_ERR_LOG}"`)
    const clean = stdout.replace(/\x1B\[[0-9;]*m/g, '').trim()
    text = clean ? `\`\`\`\n${clean.slice(-3800)}\n\`\`\`` : '✅ Sin errores recientes.'
  } catch {
    text = '❌ No se pudo leer el archivo de errores.'
  }
  await ctx.api.editMessageText(ctx.chat.id, msg.message_id, text, { parse_mode: 'Markdown' })
})

// ── /report ───────────────────────────────────────────────────────────────────
bot.command('report', async ctx => {
  const msg = await ctx.reply('⏳ Consultando base de datos...')
  const text = await buildFullReport('📊')
  await ctx.api.editMessageText(ctx.chat.id, msg.message_id, text, { parse_mode: 'Markdown' })
})

// ── /progress ─────────────────────────────────────────────────────────────────
bot.command('progress', async ctx => {
  const msg = await ctx.reply('⏳ Consultando...')
  const rows = await db
    .select({
      email: users.email,
      completed: sql<number>`cast(count(case when ${epicrisisAssignments.completedAt} is not null then 1 end) as int)`,
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(epicrisisAssignments)
    .innerJoin(users, eq(epicrisisAssignments.userId, users.id))
    .groupBy(users.id, users.email)

  if (rows.length === 0) {
    await ctx.api.editMessageText(ctx.chat.id, msg.message_id, 'Sin asignaciones registradas.')
    return
  }
  let text = `👥 *Progreso por anotador*\n\n`
  for (const r of rows) {
    const name = r.email.split('@')[0]
    const pct = r.total > 0 ? Math.round((Number(r.completed) / Number(r.total)) * 100) : 0
    text += `👤 *${name}*\n${buildBar(pct)} ${pct}% — ${r.completed}/${r.total}\n\n`
  }
  await ctx.api.editMessageText(ctx.chat.id, msg.message_id, text, { parse_mode: 'Markdown' })
})

// ── /schedule ─────────────────────────────────────────────────────────────────
bot.command('schedule', async ctx => {
  const newExpr = ctx.match?.trim()

  if (newExpr) {
    if (!cron.validate(newExpr)) {
      await ctx.reply('❌ Expresión cron inválida. Ejemplo válido: `0 8,14,20 * * *`', {
        parse_mode: 'Markdown',
      })
      return
    }
    cronExpression = newExpr
    startScheduler()
    await ctx.reply(
      `✅ Horario actualizado.\n\n🕐 Nuevo horario: \`${cronExpression}\`\n📍 Zona horaria: ${TZ}`,
      { parse_mode: 'Markdown' }
    )
    return
  }

  // Solo consulta
  const muteText = muteUntil && new Date() < muteUntil
    ? `\n🔕 *Silenciado* hasta ${muteUntil.toLocaleTimeString('es-CL', { timeZone: TZ })}`
    : '\n🔔 Activo'

  await ctx.reply(
    `📅 *Horario de reportes automáticos*\n\n` +
    `Expresión cron: \`${cronExpression}\`\n` +
    `Horarios: *${describeSchedule(cronExpression)}*\n` +
    `Zona horaria: ${TZ}` +
    muteText + '\n\n' +
    `Para cambiar: /schedule \`0 8,14,20 * * *\`\n` +
    `Para silenciar: /mute \`[horas]\``,
    { parse_mode: 'Markdown' }
  )
})

// ── /mute ─────────────────────────────────────────────────────────────────────
bot.command('mute', async ctx => {
  const hours = parseInt(ctx.match || '8') || 8
  muteUntil = new Date(Date.now() + hours * 3600 * 1000)
  const until = muteUntil.toLocaleTimeString('es-CL', { timeZone: TZ })
  await ctx.reply(`🔕 Reportes automáticos silenciados por *${hours} horas* (hasta las ${until}).\nUsa /unmute para reactivar.`, {
    parse_mode: 'Markdown',
  })
})

// ── /unmute ───────────────────────────────────────────────────────────────────
bot.command('unmute', async ctx => {
  muteUntil = null
  await ctx.reply('🔔 Reportes automáticos reactivados.')
})

// ─── Arrancar scheduler y bot ─────────────────────────────────────────────────
bot.catch(err => console.error('[Bot error]', err))

startScheduler()

bot.start({
  onStart: async info => {
    console.log(`[Bot] @${info.username} activo | Reportes: "${cronExpression}" (${TZ})`)
    // Registrar comandos en Telegram → activa el autocompletado al escribir /
    await bot.api.setMyCommands(BOT_COMMANDS)
    console.log(`[Bot] ${BOT_COMMANDS.length} comandos registrados en Telegram`)
  },
})
