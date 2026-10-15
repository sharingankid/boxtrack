import { cloneDemoSessions } from '../data/demoSessions.js'
import { addDays, parisNow } from '../lib/schedule.js'
import { apiClient } from './apiClient.js'

// API mapping follows origin/V.0 API_CONTRACT.md at 666d977.
// Demo storage stays isolated from API data.
const STORAGE_KEY = 'boxtrack.planning.demo.v2'
export const capabilities = (mode) => ({ scheduling: true, title: true, staff: true, restoreVerifiedSession: mode === 'demo' })
const movementPayload = (movement) => ({ movement_name: movement.movement_name.trim(), detail: [movement.sets_reps, movement.load, movement.instructions, movement.detail].filter(Boolean).join(' · ') })
export function toApiPayload(form) {
  return {
    session_date: form.session_date, start_time: form.start_time, end_time: form.end_time, title: form.title || null,
    warmup: { general: form.warmup.general || null, specific: form.warmup.specific || null },
    skill_strength: { kind: form.skill_strength.kind, instructions: form.skill_strength.instructions, movements: form.skill_strength.movements.filter(m => m.movement_name.trim()).map(movementPayload) },
    wod: { format: form.wod.format, duration_or_target: form.wod.duration_or_target, notes: form.wod.notes, movements: form.wod.movements.filter(m => m.movement_name.trim()).map(movementPayload) },
  }
}
export function fromApi(session) {
  return { ...session, time_slot: session.start_time || session.time_slot || '', start_time: session.start_time || '', end_time: session.end_time || '', title: session.title || '' }
}
function initialDemo() {
  const today = parisNow().date
  const seeds = cloneDemoSessions()
  return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
    const session = structuredClone(seeds[index % seeds.length])
    const start = index < 3 ? ['06:00', '12:30', '18:00'][index] : '18:00'
    const end = index < 3 ? ['07:00', '13:30', '19:00'][index] : '19:00'
    return { ...session, id: 201 + index, session_date: addDays(today, index < 3 ? 0 : index - 2), time_slot: start, start_time: start, end_time: end, title: ['Force & conditionnement', 'Séance du midi', 'WOD du soir'][index % 3] }
  })
}
function readDemo() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try { const data = JSON.parse(stored); if (Array.isArray(data)) return data } catch { /* Recreate damaged demo storage only. */ }
  }
  const data = initialDemo()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}
export function createSessionAdapter(mode) {
  if (mode === 'api') return {
    list: async () => Promise.all((await apiClient.history()).map(async item => fromApi(await apiClient.detail(item.id)))),
    detail: async id => fromApi(await apiClient.detail(id)),
    save: async (form, id, token) => fromApi(await (id ? apiClient.update(id, toApiPayload(form), token) : apiClient.create(toApiPayload(form), token))),
    remove: (id, token) => apiClient.remove(id, token),
  }
  return {
    list: async () => readDemo(),
    detail: async id => readDemo().find(item => String(item.id) === String(id)),
    save: async (form, id) => {
      const data = readDemo()
      if (data.some(s => String(s.id) !== String(id) && s.session_date === form.session_date && s.start_time === form.start_time)) throw new Error('Une séance existe déjà à cette date et à cette heure.')
      if (id && !data.some(s => String(s.id) === String(id))) throw new Error('Cette séance n’existe plus.')
      const saved = { ...structuredClone(form), id: id ? Number(id) : Date.now(), time_slot: form.start_time }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(id ? data.map(s => String(s.id) === String(id) ? saved : s) : [...data, saved]))
      return saved
    },
    remove: async id => { localStorage.setItem(STORAGE_KEY, JSON.stringify(readDemo().filter(s => String(s.id) !== String(id)))) },
  }
}
export function movementDetail(item) {
  return [item.sets_reps, item.load, item.instructions, item.detail].filter(Boolean).join(' · ')
}
