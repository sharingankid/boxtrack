// Scheduling uses Europe/Paris, regardless of the display device's timezone.
export function parisNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  )
  return {
    date: `${value.year}-${value.month}-${value.day}`,
    time: `${value.hour}:${value.minute}`,
    seconds:
      Number(value.hour) * 3600 +
      Number(value.minute) * 60 +
      Number(value.second),
  }
}
export function minutes(time) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || '')) return null
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
}
export function sessionState(session, now = parisNow()) {
  if (session.session_date < now.date) return 'past'
  if (session.session_date > now.date) return 'upcoming'
  const start = minutes(session.start_time)
  const end = minutes(session.end_time)
  if (start === null) return 'unknown'
  if (now.seconds < start * 60) return 'upcoming'
  if (end === null || end <= start) return 'unknown'
  return now.seconds < end * 60 ? 'current' : 'past'
}
export function sortSessions(sessions) {
  return [...sessions].sort(
    (a, b) =>
      `${a.session_date} ${a.start_time}`.localeCompare(
        `${b.session_date} ${b.start_time}`,
      ) || Number(a.id) - Number(b.id),
  )
}
export function selectSchedule(sessions, now = parisNow()) {
  const ordered = sortSessions(sessions)
  const today = ordered.filter((s) => s.session_date === now.date)
  // If slots overlap, prefer the most recently started class, consistently on both views.
  const current =
    today.filter((s) => sessionState(s, now) === 'current').at(-1) || null
  const next = ordered.find((s) => sessionState(s, now) === 'upcoming') || null
  const nextToday =
    today.find((s) => sessionState(s, now) === 'upcoming') || null
  return {
    today,
    current,
    next,
    display: current || nextToday,
    incomplete: today.some((s) => sessionState(s, now) === 'unknown'),
  }
}
export function addDays(date, count) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + count)
  return value.toISOString().slice(0, 10)
}
export const STATE_LABELS = {
  past: 'Passée',
  current: 'En cours',
  upcoming: 'À venir',
  unknown: 'Horaire incomplet',
}
export const slotLabel = (session) =>
  session.end_time
    ? `de ${session.start_time} à ${session.end_time}`
    : session.start_time
