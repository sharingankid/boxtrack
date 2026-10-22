import test from 'node:test'
import assert from 'node:assert/strict'
import { parisNow, selectSchedule, sessionState } from '../src/lib/schedule.js'
import { toApiPayload } from '../src/services/sessionAdapter.js'
const session = (id, start_time, end_time) => ({
  id,
  session_date: '2026-10-13',
  start_time,
  end_time,
})
const sessions = [
  session(1, '09:00', '10:00'),
  session(2, '10:00', '11:00'),
  session(3, '18:00', '19:00'),
]
const now = (time) => parisNow(new Date(`2026-10-13T${time}:00+02:00`))
test('selects next before opening, current at start, and next at the exact end', () => {
  assert.equal(selectSchedule(sessions, now('08:00')).display.id, 1)
  assert.equal(selectSchedule(sessions, now('09:00')).current.id, 1)
  assert.equal(selectSchedule(sessions, now('10:00')).current.id, 2)
  assert.equal(selectSchedule(sessions, now('11:00')).display.id, 3)
  assert.equal(selectSchedule(sessions, now('19:00')).display, null)
})
test('empty day and different device timezone use the Paris calendar', () => {
  assert.equal(parisNow(new Date('2026-10-12T23:30:00Z')).date, '2026-10-13')
  assert.equal(selectSchedule([], now('10:00')).display, null)
  assert.equal(
    selectSchedule(sessions, parisNow(new Date('2026-10-14T10:00:00Z')))
      .display,
    null,
  )
})
test('overlapping classes select the latest start; missing end times are not guessed', () => {
  assert.equal(
    selectSchedule([...sessions, session(4, '09:30', '10:30')], now('09:45'))
      .current.id,
    4,
  )
  assert.equal(sessionState(session(1, '09:00', ''), now('09:45')), 'unknown')
  assert.equal(
    selectSchedule([session(1, '09:00', '')], now('09:45')).incomplete,
    true,
  )
})
test('adapter sends only documented API fields and preserves multiline and cleared Warm-Up', () => {
  const result = toApiPayload({
    session_date: '2026-10-13',
    start_time: '09:00',
    end_time: '10:00',
    title: 'Evening class',
    warmup: { general: null, specific: 'Row\nSquats' },
    skill_strength: {
      kind: 'strength',
      instructions: 'Rest',
      movements: [
        {
          movement_name: ' Squat ',
          sets_reps: '3 × 5',
          load: '40 kg',
          instructions: 'Tempo',
          detail: '',
        },
      ],
    },
    wod: {
      format: 'AMRAP',
      duration_or_target: '12 min',
      notes: 'Pace',
      movements: [],
    },
  })
  assert.equal(result.title, 'Evening class')
  assert.equal(result.end_time, '10:00')
  assert.equal(result.start_time, '09:00')
  assert.equal(result.time_slot, undefined)
  assert.deepEqual(result.warmup, { general: null, specific: 'Row\nSquats' })
  assert.deepEqual(result.skill_strength.movements, [
    { movement_name: 'Squat', detail: '3 × 5 · 40 kg · Tempo' },
  ])
})
