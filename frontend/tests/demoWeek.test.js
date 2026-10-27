import test from 'node:test'
import assert from 'node:assert/strict'
import { completeDemoWeek, weekMonday } from '../src/data/demoWeek.js'

test('demo week covers Monday to Sunday with morning, noon and evening slots', () => {
  const sessions = completeDemoWeek([], '2026-10-22')
  assert.equal(weekMonday('2026-10-22'), '2026-10-19')
  assert.equal(weekMonday('2026-10-25'), '2026-10-19')
  assert.equal(sessions.length, 21)
  assert.equal(new Set(sessions.map((item) => item.id)).size, 21)
  assert.equal(new Set(sessions.map((item) => item.session_date)).size, 7)
  assert.deepEqual(
    sessions.slice(0, 3).map((item) => item.start_time),
    ['06:00', '12:30', '18:00'],
  )
  assert.ok(
    sessions.every(
      (item) =>
        item.warmup.specific &&
        item.skill_strength.movements.length &&
        item.wod.movements.length === 3,
    ),
  )
  assert.equal(completeDemoWeek(sessions, '2026-10-22').length, 21)
})

test('existing edited or overlapping sessions survive completion of the demo week', () => {
  const existing = {
    id: 7,
    session_date: '2026-10-22',
    start_time: '17:30',
    end_time: '18:30',
    title: 'Ma séance',
  }
  const sessions = completeDemoWeek([existing], '2026-10-22')
  assert.equal(sessions.length, 21)
  assert.equal(sessions[0], existing)
  assert.ok(
    !sessions.some(
      (item) =>
        item.session_date === existing.session_date &&
        item.start_time === '18:00',
    ),
  )
})
