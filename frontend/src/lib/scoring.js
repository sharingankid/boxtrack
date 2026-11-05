// Score rules shared with backend/src/services/scoreService.js, so the demo
// mode ranks exactly like the API: a race against the clock (FOR_TIME,
// CHIPPER) is "lower wins" and typed as MM:SS, an AMRAP is rounds + reps,
// everything else (reps, kg) is "higher wins".
export const CATEGORIES = ['RX', 'Scaled', 'Modified']
export const isTimeBased = (format) => ['FOR_TIME', 'CHIPPER'].includes(format)

const TIME_RE = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/
export function parseTime(value) {
  const match = typeof value === 'string' ? TIME_RE.exec(value.trim()) : null
  if (!match) return null
  const [hours, minutes, seconds] = [Number(match[1] || 0), Number(match[2]), Number(match[3])]
  if (seconds > 59 || (match[1] !== undefined && minutes > 59)) return null
  return hours * 3600 + minutes * 60 + seconds
}

const pad = (value) => String(value).padStart(2, '0')
export function formatResult(format, value, extraReps) {
  if (isTimeBased(format)) {
    const total = Math.round(value)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    return hours ? `${hours}:${pad(minutes)}:${pad(total % 60)}` : `${minutes}:${pad(total % 60)}`
  }
  if (format === 'AMRAP')
    return extraReps === null || extraReps === undefined
      ? `${value} reps`
      : `${value} rds + ${extraReps}`
  if (format === 'STRENGTH') return `${value} kg`
  return String(value)
}

// What the member typed -> the two stored numbers (throws a French message).
export function parseResult(format, data) {
  const whole = (value) => Number.isInteger(value) && value >= 0
  if (format === 'AMRAP') {
    const reps = data.reps ?? 0
    if (!whole(data.rounds) || !whole(reps))
      throw new Error('Indiquez vos tours complets et vos reps en nombres entiers.')
    return { result_value: data.rounds, extra_reps: reps }
  }
  if (isTimeBased(format)) {
    const seconds = parseTime(data.time ?? '')
    if (seconds === null) throw new Error('Indiquez votre temps au format MM:SS.')
    return { result_value: seconds, extra_reps: null }
  }
  const value = Number(data.result_value)
  if (data.result_value === '' || data.result_value === undefined || Number.isNaN(value) || value < 0)
    throw new Error('Indiquez votre résultat (un nombre positif).')
  return { result_value: value, extra_reps: null }
}

// Standard competition ranking (1, 1, 3); extra reps break a tie on rounds.
export function rankScores(scores, format) {
  const ascending = isTimeBased(format)
  const compare = (a, b) => {
    const primary = ascending ? a.result_value - b.result_value : b.result_value - a.result_value
    return primary || (b.extra_reps || 0) - (a.extra_reps || 0)
  }
  const sorted = [...scores].sort(compare)
  let rank = 0
  return sorted.map((score, index) => {
    if (index === 0 || compare(score, sorted[index - 1]) !== 0) rank = index + 1
    return { rank, ...score, result_display: formatResult(format, score.result_value, score.extra_reps) }
  })
}
