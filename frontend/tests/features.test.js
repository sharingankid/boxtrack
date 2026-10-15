import test from 'node:test'
import assert from 'node:assert/strict'
import { formatClock, timerPlan, timerState } from '../src/lib/timer.js'
import { loadFor, percentages } from '../src/lib/loads.js'
import { sessionShareText } from '../src/lib/share.js'

const moves = (...names) => names.map((movement_name) => ({ movement_name }))

test('timer plans follow the WOD format and its target text', () => {
  assert.equal(timerPlan({ format: 'AMRAP', duration_or_target: '16 min' }).segments[0].seconds, 960)
  const emom = timerPlan({ format: 'EMOM', duration_or_target: '18 min', movements: moves('Cal Row', 'Push Press', 'Rest') })
  assert.equal(emom.segments.length, 18)
  assert.deepEqual(emom.segments.slice(0, 4).map((s) => s.label), ['Cal Row', 'Push Press', 'Rest', 'Cal Row'])
  assert.equal(emom.segments[2].type, 'rest')
  const tabata = timerPlan({ format: 'TABATA', duration_or_target: '6 rounds · 30 s / 15 s' })
  assert.deepEqual([tabata.segments.length, tabata.segments[0].seconds, tabata.segments[1].seconds], [12, 30, 15])
  assert.equal(timerPlan({ format: 'TABATA' }).segments.length, 16)
  assert.equal(timerPlan({ format: 'FOR_TIME', duration_or_target: 'Cap 14 min' }).segments[0].seconds, 840)
  assert.equal(timerPlan({ format: 'CHIPPER', duration_or_target: '' }).segments[0].seconds, Infinity)
  assert.equal(timerPlan({ format: 'STRENGTH' }).restPresets, true)
})
test('timer state walks through segments and stops at the end', () => {
  const plan = timerPlan({ format: 'EMOM', duration_or_target: '3 min' })
  assert.deepEqual(timerState(plan, 61.5), { index: 1, segment: plan.segments[1], inSegment: 1.5, remaining: 58.5, done: false })
  assert.equal(timerState(plan, 180).done, true)
  assert.equal(timerState(timerPlan({ format: 'FOR_TIME' }), 99999).done, false)
  assert.equal(formatClock(75), '01:15')
  assert.equal(formatClock(3725), '1:02:05')
})
test('loads are computed from percentages in the movement detail', () => {
  assert.deepEqual(percentages('5 × 3 @ 80 % puis 85%'), [80, 85])
  assert.deepEqual(percentages('12 reps · 40 kg'), [])
  assert.equal(loadFor(100, 80), 80)
  assert.equal(loadFor(83, 75), 62.5)
})
test('share text is readable without the app', () => {
  const text = sessionShareText({ session_date: '2026-10-13', start_time: '18:00', end_time: '19:00', title: 'WOD du soir', warmup: { general: 'Row', specific: '' }, skill_strength: null, wod: { format: 'AMRAP', duration_or_target: '12 min', notes: '', movements: [{ movement_name: 'Burpee', detail: '10 reps' }] } }, 'https://x.fr/sessions/1')
  assert.match(text, /^WOD du soir · mardi 13 octobre · 18:00 – 19:00/)
  assert.match(text, /WARM-UP\nRow/)
  assert.match(text, /AMRAP · 12 min\n• Burpee — 10 reps/)
  assert.doesNotMatch(text, /SKILL|\n{3}/)
  assert.ok(text.endsWith('https://x.fr/sessions/1'))
})
