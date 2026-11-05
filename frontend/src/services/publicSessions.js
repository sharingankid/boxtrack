import { apiClient } from './apiClient.js'
import { createSessionAdapter } from './sessionAdapter.js'
import { addDays, sortSessions } from '../lib/schedule.js'

// Public pages read the API, or the coach demo's local sessions in demo mode.
export function loadToday(mode, date) {
  if (mode !== 'demo') return apiClient.today()
  return createSessionAdapter('demo')
    .list()
    .then((items) => items.filter((s) => s.session_date === date))
}

export function loadUpcoming(mode, date, limit = 10) {
  if (mode !== 'demo') return apiClient.history({ from: date, limit })
  return createSessionAdapter('demo')
    .list()
    .then((items) =>
      sortSessions(items.filter((s) => s.session_date >= date)).slice(0, limit),
    )
}

// Past sessions of the box (members only), newest first.
export function loadPast(mode, date, limit = 20) {
  const yesterday = addDays(date, -1)
  if (mode !== 'demo') return apiClient.history({ to: yesterday, limit })
  return createSessionAdapter('demo')
    .list()
    .then((items) =>
      sortSessions(items.filter((s) => s.session_date <= yesterday))
        .reverse()
        .slice(0, limit),
    )
}

export function loadSession(mode, id) {
  return createSessionAdapter(mode).detail(id)
}
