import test from 'node:test'
import assert from 'node:assert/strict'
import { validateSession } from '../src/lib/validation.js'

const form = (wod) => ({
  session_date: '2026-11-03',
  start_time: '18:00',
  end_time: '19:00',
  skill_strength: { kind: 'none', movements: [] },
  wod: { format: 'AMRAP', duration_or_target: '', movements: [], ...wod },
})

test('a WOD needs at least one movement or a duration / target, like the API', () => {
  assert.match(validateSession(form()).wod, /au moins un mouvement/)
  assert.match(
    validateSession(form({ movements: [{ movement_name: '  ' }] })).wod,
    /au moins un mouvement/,
  )
  assert.deepEqual(
    validateSession(form({ movements: [{ movement_name: 'Burpee' }] })),
    {},
  )
  assert.deepEqual(
    validateSession(form({ duration_or_target: 'Max Clean & Jerk' })),
    {},
  )
})
