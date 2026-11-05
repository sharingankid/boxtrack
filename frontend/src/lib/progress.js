import { addDays } from './schedule.js'
import { isTimeBased } from './scoring.js'

// Monday of the week of an ISO date.
export function weekStart(date) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()
  return addDays(date, -((weekday + 6) % 7))
}

// Sessions scored per week, oldest first, ending with the current week.
export function weeklyCounts(scores, today, weeks = 8) {
  const current = weekStart(today)
  return Array.from({ length: weeks }, (_, index) => {
    const start = addDays(current, (index - weeks + 1) * 7)
    return {
      start,
      count: scores.filter((score) => weekStart(score.session_date) === start).length,
    }
  })
}

// Consecutive weeks with at least one scored session, up to this week (a
// week not trained yet doesn't break the streak until it's over).
export function weekStreak(scores, today) {
  const weeks = new Set(scores.map((score) => weekStart(score.session_date)))
  let start = weekStart(today)
  if (!weeks.has(start)) start = addDays(start, -7)
  let streak = 0
  while (weeks.has(start)) {
    streak += 1
    start = addDays(start, -7)
  }
  return streak
}

// Where the member finished in the class, 100 = first, 0 = last: comparable
// across formats and class sizes.
export const percentile = ({ rank, participants }) =>
  participants > 1 ? Math.round((1 - (rank - 1) / (participants - 1)) * 100) : 100

// Oldest first, for a line chart.
export function placementHistory(scores, limit = 12) {
  return [...scores]
    .filter((score) => score.rank)
    .sort((a, b) => `${a.session_date} ${a.start_time}`.localeCompare(`${b.session_date} ${b.start_time}`))
    .slice(-limit)
    .map((score) => ({ ...score, percentile: percentile(score) }))
}

// 100 XP per scored session, +50 for a win, +25 for another podium.
export const LEVEL_XP = 400
export function experience(scores) {
  const xp = scores.reduce(
    (total, score) => total + 100 + (score.rank === 1 ? 50 : score.rank <= 3 ? 25 : 0),
    0,
  )
  return { xp, level: Math.floor(xp / LEVEL_XP) + 1, progress: (xp % LEVEL_XP) / LEVEL_XP }
}

// Best result per WOD format (lowest time, most rounds + reps, most kg...).
export function records(scores) {
  const best = new Map()
  for (const score of scores) {
    const current = best.get(score.format)
    const better =
      !current ||
      (isTimeBased(score.format)
        ? score.result_value < current.result_value
        : score.result_value > current.result_value ||
          (score.result_value === current.result_value &&
            (score.extra_reps || 0) > (current.extra_reps || 0)))
    if (better) best.set(score.format, score)
  }
  return [...best.values()]
}

export function summary(scores) {
  return {
    sessions: scores.length,
    wins: scores.filter((score) => score.rank === 1).length,
    podiums: scores.filter((score) => score.rank && score.rank <= 3).length,
  }
}
