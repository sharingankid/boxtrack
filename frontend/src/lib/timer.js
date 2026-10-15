// A timer plan is a list of segments read from the WOD format and its target text.
const minutesIn = (text) => {
  const match = /(\d+(?:[.,]\d+)?)\s*(?:min|mn|')/i.exec(text || '')
  return match ? Math.round(parseFloat(match[1].replace(',', '.')) * 60) : null
}
const isRest = (name) => /^(rest|repos)\b/i.test(name || '')
const cycle = (moves, index, fallback) => (moves.length ? moves[index % moves.length] : fallback)

export const REST_PRESETS = [60, 90, 120, 180]

export function timerPlan(wod = {}) {
  const target = wod.duration_or_target || ''
  const moves = (wod.movements || []).map((m) => m.movement_name).filter(Boolean)
  switch (wod.format) {
    case 'AMRAP': {
      const seconds = minutesIn(target) ?? 20 * 60
      return { mode: 'down', rounds: true, summary: `${seconds / 60} min, un maximum de tours`, segments: [{ type: 'work', seconds, label: 'AMRAP' }] }
    }
    case 'EMOM': {
      const count = Math.max(1, Math.round((minutesIn(target) ?? 10 * 60) / 60))
      const segments = Array.from({ length: count }, (_, i) => {
        const label = cycle(moves, i, `Minute ${i + 1}`)
        return { type: isRest(label) ? 'rest' : 'work', seconds: 60, label, round: i + 1, of: count }
      })
      return { mode: 'down', summary: `${count} × 1 min${moves.length > 1 ? ', mouvements en rotation' : ''}`, segments }
    }
    case 'TABATA': {
      const rounds = Number(/(\d+)\s*(?:rounds?|tours?)/i.exec(target)?.[1]) || 8
      const split = /(\d+)\s*s?\s*\/\s*(\d+)\s*s?/i.exec(target)
      const work = Number(split?.[1]) || 20
      const rest = Number(split?.[2]) || 10
      const segments = Array.from({ length: rounds }, (_, i) => [
        { type: 'work', seconds: work, label: cycle(moves, i, 'Travail'), round: i + 1, of: rounds },
        { type: 'rest', seconds: rest, label: 'Repos', round: i + 1, of: rounds },
      ]).flat()
      return { mode: 'down', summary: `${rounds} rounds · ${work} s / ${rest} s`, segments }
    }
    case 'STRENGTH':
      return { mode: 'down', restPresets: true, summary: 'Minuteur de repos entre les séries', segments: [{ type: 'rest', seconds: 120, label: 'Repos' }] }
    default: {
      // For Time and Chipper count up, stopped by the time cap when there is one.
      const cap = minutesIn(target)
      return { mode: 'up', rounds: true, summary: cap ? `Time cap ${cap / 60} min` : 'Chrono libre', segments: [{ type: 'work', seconds: cap ?? Infinity, label: 'For Time' }] }
    }
  }
}

export function timerState(plan, elapsed) {
  let rest = Math.max(0, elapsed)
  for (let index = 0; index < plan.segments.length; index += 1) {
    const segment = plan.segments[index]
    if (rest < segment.seconds) return { index, segment, inSegment: rest, remaining: segment.seconds - rest, done: false }
    rest -= segment.seconds
  }
  const index = plan.segments.length - 1
  const segment = plan.segments[index]
  return { index, segment, inSegment: segment.seconds, remaining: 0, done: true }
}

export const formatClock = (seconds) => {
  const value = Math.max(0, seconds)
  const hours = Math.floor(value / 3600)
  const mm = String(Math.floor((value % 3600) / 60)).padStart(2, '0')
  const ss = String(Math.floor(value % 60)).padStart(2, '0')
  return hours ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}
