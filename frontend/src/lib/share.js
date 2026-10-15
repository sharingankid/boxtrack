import { movementDetail } from '../services/sessionAdapter.js'
import { FORMAT_LABELS, formatDate } from './format.js'
import { slotLabel } from './schedule.js'

const lines = (movements = []) => movements.map((m) => `• ${m.movement_name}${movementDetail(m) ? ` — ${movementDetail(m)}` : ''}`)

export function sessionShareText(session, url = '') {
  const skill = session.skill_strength
  return [
    `${session.title ? `${session.title} · ` : ''}${formatDate(session.session_date)} · ${slotLabel(session)}`,
    '',
    (session.warmup?.general || session.warmup?.specific) && ['WARM-UP', session.warmup.general, session.warmup.specific].filter(Boolean).join('\n'),
    (skill?.instructions || skill?.movements?.length) && [skill.kind === 'strength' ? 'STRENGTH' : 'SKILL', skill.instructions, ...lines(skill.movements)].filter(Boolean).join('\n'),
    [`${FORMAT_LABELS[session.wod?.format] || 'WOD'}${session.wod?.duration_or_target ? ` · ${session.wod.duration_or_target}` : ''}`, ...lines(session.wod?.movements), session.wod?.notes && `Notes : ${session.wod.notes}`].filter(Boolean).join('\n'),
    url,
  ].filter((part) => part !== undefined && part !== null && part !== false).join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
}
