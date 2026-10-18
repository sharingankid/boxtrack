import { isTimeBasedFormat } from '../lib/format.js'
import { demoAthletes } from './demoAthletes.js'

// Keyed by demo session id (see demoSessions.js) - 101 is AMRAP (higher
// result_value wins), 102 is FOR_TIME (lower, in seconds, wins).
export const demoScoresBySessionId = {
  101: [
    { id: 501, athlete_id: 1, category: 'RX', result_value: 187 },
    { id: 502, athlete_id: 2, category: 'RX', result_value: 164 },
    { id: 503, athlete_id: 3, category: 'Scaled', result_value: 142 },
    { id: 504, athlete_id: 4, category: 'RX', result_value: 201 },
  ],
  102: [
    { id: 511, athlete_id: 1, category: 'RX', result_value: 612 },
    { id: 512, athlete_id: 2, category: 'RX', result_value: 578 },
    { id: 513, athlete_id: 4, category: 'Scaled', result_value: 701 },
  ],
}

function athleteFor(id) {
  const athlete = demoAthletes.find((item) => item.id === id)
  return athlete ? { id: athlete.id, first_name: athlete.first_name, last_name: athlete.last_name } : { id, first_name: '—', last_name: '' }
}

export const cloneDemoScores = (sessionId) =>
  structuredClone(demoScoresBySessionId[sessionId] || []).map((score) => ({ ...score, athlete: athleteFor(score.athlete_id) }))

// Mirrors backend/src/services/scoreService.js's ranking logic, for the
// demo-mode leaderboard (no backend involved).
export const computeDemoLeaderboard = (sessionId, format) => {
  const scores = cloneDemoScores(sessionId)
  const ascending = isTimeBasedFormat(format)
  const rankings = {}
  for (const category of ['RX', 'Scaled', 'Modified']) {
    rankings[category] = scores
      .filter((s) => s.category === category)
      .sort((a, b) => (ascending ? a.result_value - b.result_value : b.result_value - a.result_value))
      .map((score, index) => ({ rank: index + 1, ...score }))
  }
  return { format, sort: ascending ? 'asc' : 'desc', rankings }
}
