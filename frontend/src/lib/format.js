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
    weekday: 'long', day: 'numeric', month: 'long', ...options,
  }).format(date)
}

export const shortDate = (value) => formatDate(value, { weekday: 'short', month: 'short' })
