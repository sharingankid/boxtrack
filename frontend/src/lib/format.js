export const FORMAT_LABELS = {
  AMRAP: 'AMRAP',
  FOR_TIME: 'For Time',
  EMOM: 'EMOM',
  TABATA: 'Tabata',
  CHIPPER: 'Chipper',
  STRENGTH: 'Strength',
}

export const SESSION_FORMATS = Object.keys(FORMAT_LABELS)

export const toLocalISODate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDate = (value, options = {}) => {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...options,
  }).format(date)
}

export const shortDate = (value) =>
  formatDate(value, { weekday: 'short', month: 'short' })

// Scoring convention matching backend/src/services/scoreService.js: a race
// against the clock is "lower wins" and entered as MM:SS; everything else
// (rounds+reps, kg) is "higher wins" and entered as a plain number.
export const TIME_BASED_FORMATS = ['FOR_TIME', 'CHIPPER']
export const isTimeBasedFormat = (format) => TIME_BASED_FORMATS.includes(format)

const RESULT_UNITS = {
  AMRAP: 'reps',
  EMOM: 'reps',
  TABATA: 'reps',
  STRENGTH: 'kg',
}

export const clockToSeconds = (clock) => {
  const parts = String(clock)
    .split(':')
    .map((part) => Number(part))
  if (parts.some((part) => Number.isNaN(part))) return null
  return parts.reduce((total, part) => total * 60 + part, 0)
}

export const secondsToClock = (totalSeconds) => {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0))
  const minutes = Math.floor(seconds / 60)
  const remainder = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainder}`
}

export const formatResult = (format, value) =>
  isTimeBasedFormat(format)
    ? secondsToClock(value)
    : `${value} ${RESULT_UNITS[format] || ''}`.trim()

// TV display: coach shorthand dashes become plain punctuation. Bullets at line
// start are dropped and spaced dashes become commas; hyphens inside words or
// rep schemes (Toes-to-Bar, 21-15-9) are kept.
export const withoutDashes = (value) =>
  value?.replace(/^[ \t]*[-–—][ \t]+/gm, '').replace(/[ \t]+[-–—][ \t]+/g, ', ')
