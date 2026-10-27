import test from 'node:test'
import assert from 'node:assert/strict'
import {
  generateSession,
  GENERATOR_EQUIPMENT,
} from '../src/lib/sessionGenerator.js'
import { validateSession } from '../src/lib/validation.js'
import { toApiPayload } from '../src/services/sessionAdapter.js'

test('all generator formats, levels and durations produce editable, valid sessions with an exact time budget', () => {
  for (const level of ['beginner', 'intermediate', 'advanced'])
    for (const duration of [30, 45, 60, 75])
      for (const format of ['AMRAP', 'EMOM', 'FOR_TIME'])
        for (const goal of ['mixed', 'strength', 'cardio']) {
          const plan = generateSession(
            { goal, level, duration, format, startTime: '09:00' },
            () => 0,
          )
          assert.deepEqual(
            validateSession({
              ...plan,
              session_date: '2026-10-22',
              start_time: '09:00',
            }),
            {},
          )
          const allocation = [
            ...plan.wod.notes.matchAll(
              /(\d+) min (?:échauffement|force|technique|transitions|WOD|retour au calme)/g,
            ),
          ].map((match) => Number(match[1]))
          assert.equal(
            allocation.reduce((sum, value) => sum + value, 0),
            duration,
          )
          assert.equal(plan.wod.movements.length, 3)
          assert.equal(
            new Set(plan.wod.movements.map((item) => item.movement_name)).size,
            3,
          )
          if (format === 'EMOM')
            assert.equal(
              Number(plan.wod.duration_or_target.split(' ')[0]) % 4,
              0,
            )
          assert.equal(
            toApiPayload({
              ...plan,
              session_date: '2026-10-22',
              start_time: '09:00',
            }).wod.movements.length,
            3,
          )
        }
})

test('equipment and exclusions constrain the entire proposal, including warm-up and strength', () => {
  const options = {
    goal: 'strength',
    level: 'advanced',
    equipment: GENERATOR_EQUIPMENT.map(([key]) => key),
    exclude: 'squat, deadlift, push, burpee, row, bike, swing',
    startTime: '12:00',
  }
  const plan = generateSession(options, () => 0.99)
  for (const word of options.exclude.split(', '))
    assert.ok(!JSON.stringify(plan).toLowerCase().includes(word), word)
  const bodyweight = generateSession(
    { goal: 'strength', level: 'advanced', equipment: [] },
    () => 0.99,
  )
  assert.ok(
    !/Dumbbell|Kettlebell|"Row"|"Bike"|"Front Squat"|"Deadlift"/.test(
      JSON.stringify(bodyweight),
    ),
  )
  assert.ok(bodyweight.wod.movements.every((item) => !item.load))
})

test('unusable constraints and midnight overflow fail clearly instead of ignoring restrictions', () => {
  assert.throws(
    () =>
      generateSession({
        exclude: 'squat, fente, glute, pompe, dead bug, mountain, marche',
      }),
    /Pas assez/,
  )
  assert.throws(
    () => generateSession({ startTime: '23:30', duration: 60 }),
    /minuit/,
  )
  assert.throws(() => generateSession({ startTime: '' }), /heure de début/)
  assert.throws(() => generateSession({ duration: 5 }), /critères/)
})
