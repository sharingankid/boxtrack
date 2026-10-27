import { addDays, minutes } from '../lib/schedule.js'
import { generateSession } from '../lib/sessionGenerator.js'

export function weekMonday(date) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()
  return addDays(date, -((weekday + 6) % 7))
}

// Fill only free demo slots; existing sessions and coach edits always win.
export function completeDemoWeek(existing, today) {
  const monday = weekMonday(today)
  const result = [...existing]
  const slots = ['06:00', '12:30', '18:00']
  const themes = [
    'Force & contrôle',
    'Endurance',
    'Équilibre & technique',
    'Force du bas du corps',
    'Conditionnement',
    'Circuit du week-end',
    'Technique & régularité',
  ]
  for (let day = 0; day < 7; day += 1) {
    const date = addDays(monday, day)
    slots.forEach((start, slot) => {
      const begin = minutes(start)
      if (
        result.some(
          (item) =>
            item.session_date === date &&
            (item.start_time === start ||
              (minutes(item.start_time) !== null &&
                minutes(item.end_time) !== null &&
                minutes(item.start_time) < begin + 60 &&
                minutes(item.end_time) > begin)),
        )
      )
        return
      const plan = generateSession(
        {
          goal: ['strength', 'cardio', 'mixed'][day % 3],
          level: 'intermediate',
          duration: 60,
          format: ['AMRAP', 'EMOM', 'FOR_TIME'][(day + slot) % 3],
          equipment: ['dumbbells', 'kettlebell', 'barbell', 'rower', 'bike'],
          startTime: start,
        },
        () => ((day * 7 + slot * 3 + 1) % 11) / 11,
      )
      result.push({
        ...plan,
        id: Number(date.replaceAll('-', '')) * 10 + slot,
        session_date: date,
        start_time: start,
        title: `${themes[day]} · ${['Matin', 'Midi', 'Soir'][slot]}`,
      })
    })
  }
  return result
}
