import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addFinisher,
  formatElapsed,
  rankFinishers,
} from '../src/lib/classTimer.js'

test('class timer formats minutes, tenths and hours', () => {
  assert.equal(formatElapsed(0), '00:00.0')
  assert.equal(formatElapsed(754_300), '12:34.3')
  assert.equal(formatElapsed(3_725_000), '1:02:05.0')
  assert.equal(formatElapsed(-50), '00:00.0')
})

test('finishers are ranked fastest first, ties share a rank, gaps are to the winner', () => {
  const ranking = rankFinishers([
    { id: 1, name: 'Léa', time: 600_000 },
    { id: 2, name: 'Tom', time: 540_000 },
    { id: 3, name: 'Inès', time: 600_000 },
    { id: 4, name: 'Max', time: 660_000 },
  ])
  assert.deepEqual(
    ranking.map(({ name, rank, gap }) => [name, rank, gap]),
    [
      ['Tom', 1, 0],
      ['Léa', 2, 60_000],
      ['Inès', 2, 60_000],
      ['Max', 4, 120_000],
    ],
  )
})

test('a finisher needs a name and can only be ranked once', () => {
  assert.equal(addFinisher([], '   ', 1000).error, 'Indiquez un prénom.')
  const { finishers } = addFinisher([], '  Léa   Martin ', 1000)
  assert.equal(finishers[0].name, 'Léa Martin')
  assert.match(addFinisher(finishers, 'léa martin', 2000).error, /déjà/)
})
