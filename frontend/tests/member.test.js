import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatResult,
  parseResult,
  parseTime,
  rankScores,
} from '../src/lib/scoring.js'
import {
  experience,
  percentile,
  placementHistory,
  records,
  summary,
  weekStreak,
  weeklyCounts,
} from '../src/lib/progress.js'

test('scores are parsed, shown and ranked like the API does', () => {
  assert.equal(parseTime('12:34'), 754)
  assert.equal(parseTime('1:02:03'), 3723)
  assert.equal(parseTime('12:75'), null)
  assert.deepEqual(parseResult('FOR_TIME', { time: '9:05' }), { result_value: 545, extra_reps: null })
  assert.deepEqual(parseResult('AMRAP', { rounds: 8, reps: 12 }), { result_value: 8, extra_reps: 12 })
  assert.throws(() => parseResult('AMRAP', { rounds: 2.5 }), /tours/)
  assert.throws(() => parseResult('FOR_TIME', { time: 'vite' }), /MM:SS/)
  assert.equal(formatResult('FOR_TIME', 754), '12:34')
  assert.equal(formatResult('AMRAP', 8, 12), '8 rds + 12')
  assert.equal(formatResult('STRENGTH', 92.5), '92.5 kg')
  const times = rankScores(
    [
      { athlete: { id: 1 }, result_value: 600 },
      { athlete: { id: 2 }, result_value: 540 },
      { athlete: { id: 3 }, result_value: 600 },
    ],
    'FOR_TIME',
  )
  assert.deepEqual(times.map((s) => [s.athlete.id, s.rank]), [[2, 1], [1, 2], [3, 2]])
  const amrap = rankScores(
    [
      { athlete: { id: 1 }, result_value: 8, extra_reps: 3 },
      { athlete: { id: 2 }, result_value: 8, extra_reps: 12 },
      { athlete: { id: 3 }, result_value: 9, extra_reps: 0 },
    ],
    'AMRAP',
  )
  assert.deepEqual(amrap.map((s) => s.athlete.id), [3, 2, 1])
})

const SCORES = [
  { session_date: '2026-11-03', start_time: '06:00', format: 'FOR_TIME', result_value: 700, rank: 1, participants: 9 },
  { session_date: '2026-10-28', start_time: '18:00', format: 'FOR_TIME', result_value: 650, rank: 3, participants: 5 },
  { session_date: '2026-10-21', start_time: '12:30', format: 'AMRAP', result_value: 7, extra_reps: 4, rank: 5, participants: 5 },
  { session_date: '2026-10-07', start_time: '12:30', format: 'AMRAP', result_value: 7, extra_reps: 9, rank: 2, participants: 4 },
]

test('progress: weekly counts, streak, placement, XP and records', () => {
  const weeks = weeklyCounts(SCORES, '2026-11-03', 5)
  assert.deepEqual(weeks.map((w) => [w.start, w.count]), [
    ['2026-10-05', 1],
    ['2026-10-12', 0],
    ['2026-10-19', 1],
    ['2026-10-26', 1],
    ['2026-11-02', 1],
  ])
  assert.equal(weekStreak(SCORES, '2026-11-03'), 3)
  // An untrained current week doesn't break the streak yet.
  assert.equal(weekStreak(SCORES.slice(1), '2026-11-03'), 2)
  assert.equal(percentile({ rank: 1, participants: 9 }), 100)
  assert.equal(percentile({ rank: 5, participants: 5 }), 0)
  assert.equal(percentile({ rank: 1, participants: 1 }), 100)
  assert.deepEqual(placementHistory(SCORES).map((s) => s.percentile), [67, 0, 50, 100])
  assert.deepEqual(experience(SCORES), { xp: 500, level: 2, progress: 100 / 400 })
  assert.deepEqual(
    records(SCORES).map((s) => [s.format, s.result_value, s.extra_reps]),
    [
      ['FOR_TIME', 650, undefined],
      ['AMRAP', 7, 9],
    ],
  )
  assert.deepEqual(summary(SCORES), { sessions: 4, wins: 1, podiums: 3 })
})

test('demo member space: accounts, own scores in the class leaderboard, no future scores', async () => {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  }
  const { createMemberAdapter } = await import('../src/services/memberAdapter.js')
  const { createSessionAdapter } = await import('../src/services/sessionAdapter.js')
  const { parisNow, addDays } = await import('../src/lib/schedule.js')
  const adapter = createMemberAdapter('demo')
  const today = parisNow().date

  await assert.rejects(adapter.register({ first_name: 'Zoé', last_name: 'R', email: 'zoe', password: 'x' }), { status: 400 })
  const account = await adapter.register({
    first_name: 'Zoé',
    last_name: 'Roux',
    email: ' Zoe@Box.fr ',
    password: 'motdepasse',
    avatar: 'womanB',
  })
  assert.equal(account.member.email, 'zoe@box.fr')
  assert.ok(!JSON.stringify([...store.values()]).includes('motdepasse'), 'password not stored as typed')
  await assert.rejects(adapter.register({ first_name: 'Z', last_name: 'R', email: 'zoe@box.fr', password: 'motdepasse' }), { status: 409 })
  await assert.rejects(adapter.login({ email: 'zoe@box.fr', password: 'mauvais-mdp' }), { status: 401 })
  const { token } = await adapter.login({ email: 'ZOE@box.fr', password: 'motdepasse' })

  const sessions = await createSessionAdapter('demo').list()
  const todays = sessions.find((s) => s.session_date === today && s.wod)
  const score =
    todays.wod.format === 'AMRAP'
      ? { rounds: 99, reps: 0 }
      : ['FOR_TIME', 'CHIPPER'].includes(todays.wod.format)
        ? { time: '1:00' }
        : { result_value: 999 }
  const result = await adapter.submitScore({ wod_id: todays.id, category: 'RX', ...score }, token)
  assert.equal(result.score.rank, 1, 'an unbeatable score is first')
  assert.ok(result.leaderboard.rankings.RX.length > 1, 'demo classmates are in the class')

  const mine = await adapter.scores(token)
  assert.equal(mine.length, 1)
  assert.equal(mine[0].rank, 1)
  assert.equal(mine[0].participants, result.leaderboard.rankings.RX.length)

  const later = sessions.find((s) => s.session_date > today && s.wod)
  if (later)
    await assert.rejects(adapter.submitScore({ wod_id: later.id, category: 'RX', ...score }, token), { status: 400 })
  assert.ok(addDays(today, 1) > today)
})
