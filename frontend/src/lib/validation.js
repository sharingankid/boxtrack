import { minutes } from './schedule.js'
export function validateSession(form) {
  const errors = {}
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(form.session_date) ||
    Number.isNaN(Date.parse(form.session_date)) ||
    new Date(form.session_date).toISOString().slice(0, 10) !== form.session_date
  )
    errors.schedule = 'Choisissez une date valide.'
  else if (minutes(form.start_time) === null)
    errors.schedule = 'L’heure de début est obligatoire.'
  else if (minutes(form.end_time) === null)
    errors.schedule = 'L’heure de fin est obligatoire.'
  else if (minutes(form.end_time) <= minutes(form.start_time))
    errors.schedule = 'L’heure de fin doit être après le début, le même jour.'
  for (const [block, key] of [
    ['skill_strength', 'skill'],
    ['wod', 'wod'],
  ]) {
    if (form[block].kind === 'none') continue
    const index = form[block].movements.findIndex(
      (m) =>
        !m.movement_name.trim() &&
        [m.sets, m.reps, m.load, m.instructions, m.detail].some(Boolean),
    )
    if (index >= 0)
      errors[key] =
        `Mouvement ${index + 1} : le nom est obligatoire. Complétez-le ou supprimez ce mouvement.`
  }
  return errors
}
