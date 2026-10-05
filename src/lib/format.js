export const FORMAT_LABELS = {
  AMRAP: 'AMRAP',
  FOR_TIME: 'For Time',
  EMOM: 'EMOM',
  TABATA: 'Tabata',
  CHIPPER: 'Chipper',
  STRENGTH: 'Strength',
}

export const SESSION_FORMATS = Object.keys(FORMAT_LABELS)

export const formatDate = (value, options = {}) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', ...options,
  }).format(new Date(`${value}T12:00:00`))
}

export const shortDate = (value) => formatDate(value, { weekday: 'short', month: 'short' })
