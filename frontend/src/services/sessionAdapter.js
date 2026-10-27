import { completeDemoWeek, weekMonday } from '../data/demoWeek.js'
import { withoutDashes } from '../lib/format.js'
import { parisNow } from '../lib/schedule.js'
import { apiClient } from './apiClient.js'

// API mapping follows origin/V.0 API_CONTRACT.md at 666d977.
// Demo storage stays isolated from API data.
const STORAGE_KEY = 'boxtrack.planning.demo.v2'
const movementPayload = (movement) => ({
  movement_name: movement.movement_name.trim(),
  detail: [
    movement.sets ? `${movement.sets} séries` : '',
    movement.reps ? `${movement.reps} reps` : '',
    movement.sets_reps,
    movement.load,
    movement.instructions,
    movement.detail,
  ]
    .filter(Boolean)
    .join(' · '),
})
export function toApiPayload(form) {
  return {
    session_date: form.session_date,
    start_time: form.start_time,
    end_time: form.end_time,
    title: form.title || null,
    warmup: {
      general: form.warmup.general || null,
      specific: form.warmup.specific || null,
    },
    skill_strength:
      form.skill_strength.kind === 'none' ||
      (!form.skill_strength.instructions &&
        !form.skill_strength.movements.some((m) => m.movement_name.trim()))
        ? null
        : {
            kind: form.skill_strength.kind,
            instructions: form.skill_strength.instructions,
            movements: form.skill_strength.movements
              .filter((m) => m.movement_name.trim())
              .map(movementPayload),
          },
    wod: {
      format: form.wod.format,
      duration_or_target: form.wod.duration_or_target,
      notes: form.wod.notes,
      movements: form.wod.movements
        .filter((m) => m.movement_name.trim())
        .map(movementPayload),
    },
  }
}
export function fromApi(session) {
  return {
    ...session,
    start_time: session.start_time || '',
    end_time: session.end_time || '',
    title: session.title || '',
  }
}
function readDemo() {
  let data = []
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(stored)) data = stored
  } catch {
    /* Recreate damaged demo storage only. */
  }
  const today = parisNow().date
  const weekKey = `${STORAGE_KEY}.week.${weekMonday(today)}`
  if (!localStorage.getItem(weekKey)) {
    data = completeDemoWeek(data, today)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    localStorage.setItem(weekKey, '1')
  }
  return data
}
export function createSessionAdapter(mode) {
  if (mode === 'api')
    return {
      list: async () =>
        Promise.all(
          (await apiClient.history()).map(async (item) =>
            fromApi(await apiClient.detail(item.id)),
          ),
        ),
      detail: async (id) => fromApi(await apiClient.detail(id)),
      save: async (form, id, token) =>
        fromApi(
          await (id
            ? apiClient.update(id, toApiPayload(form), token)
            : apiClient.create(toApiPayload(form), token)),
        ),
      remove: (id, token) => apiClient.remove(id, token),
    }
  return {
    list: async () => readDemo(),
    detail: async (id) =>
      readDemo().find((item) => String(item.id) === String(id)),
    save: async (form, id) => {
      const data = readDemo()
      if (
        data.some(
          (s) =>
            String(s.id) !== String(id) &&
            s.session_date === form.session_date &&
            s.start_time === form.start_time,
        )
      ) {
        const error = new Error(
          'Une séance existe déjà à cette date et à cette heure.',
        )
        error.status = 409
        throw error
      }
      if (id && !data.some((s) => String(s.id) === String(id)))
        throw new Error('Cette séance n’existe plus.')
      const saved = { ...toApiPayload(form), id: id ? Number(id) : Date.now() }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          id
            ? data.map((s) => (String(s.id) === String(id) ? saved : s))
            : [...data, saved],
        ),
      )
      return saved
    },
    remove: async (id) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(readDemo().filter((s) => String(s.id) !== String(id))),
      )
    },
  }
}
export function movementDetail(item) {
  const detail = [
    item.sets ? `${item.sets} séries` : '',
    item.reps ? `${item.reps} reps` : '',
    item.sets_reps,
    item.load,
    item.instructions,
    item.detail,
  ]
    .filter(Boolean)
    .join(' · ')
  // "@ 80 %" is coach shorthand; spell it out for athletes reading the screen.
  return withoutDashes(detail.replace(/\s*@\s*/g, ' à '))
}
