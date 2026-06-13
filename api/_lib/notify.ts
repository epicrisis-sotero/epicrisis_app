const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = (process.env.TELEGRAM_USER_IDS || '').split(',')[0]?.trim()

export async function notifyAnnotationSubmitted(opts: {
  epicrisisId: number
  patientId: string | null
  annotatorEmail: string
  newStatus: 'in_review' | 'reviewed' | 'needs_expert_review'
  totalAssignees: number
  completedAssignees: number
}) {
  if (!TOKEN || !CHAT_ID) return

  const epcLabel = `EPC-${String(opts.epicrisisId).padStart(5, '0')}${opts.patientId ? ` · ${opts.patientId}` : ''}`
  const annotator = opts.annotatorEmail.split('@')[0]
  const now = new Date().toLocaleString('es-CL', {
    timeZone: process.env.REPORT_TIMEZONE || 'America/Santiago',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  let statusLine: string
  if (opts.newStatus === 'needs_expert_review') {
    statusLine = '⚠️ *Requiere revisión experta* — demasiados criterios marcados como "no determinable"'
  } else if (opts.newStatus === 'reviewed') {
    statusLine = '✅ *Completada* — todos los anotadores enviaron'
  } else {
    const pending = opts.totalAssignees - opts.completedAssignees
    statusLine = `⏳ *En revisión* — falta${pending > 1 ? 'n' : ''} ${pending} anotador${pending > 1 ? 'es' : ''}`
  }

  const text = [
    '🔔 *Nueva anotación enviada*',
    '',
    `📋 ${epcLabel}`,
    `👤 ${annotator}`,
    `📊 ${statusLine}`,
    `🕐 ${now}`,
  ].join('\n')

  // Fire-and-forget — no bloqueamos la respuesta HTTP si falla
  fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
  }).catch(() => {/* silencioso */})
}
