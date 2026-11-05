import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ATHLETES } from '../src/data/athletes.js'
import {
  athleteIndexFor,
  movementAnimation,
} from '../src/lib/movementAnimation.js'
import {
  POSES,
  SIDE_POSES,
  NEUTRAL,
  handY,
  poseAt,
  propY,
  sidePixels,
} from '../src/lib/athletePoses.js'

test('every pixel athlete is a complete 32 × 48 sprite with a valid palette', () => {
  assert.equal(ATHLETES.length, 4)
  for (const athlete of ATHLETES) {
    assert.equal(athlete.rows.length, 48)
    for (const row of athlete.rows) {
      assert.equal(row.length, 32)
      for (const char of row.replaceAll('.', ''))
        assert.ok(
          '0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(char) < athlete.palette.length,
        )
    }
  }
})

test('the sprite data still matches the mock-up SVG files', () => {
  const files = ['athlete-man-a', 'athlete-man-b', 'athlete-woman-a', 'athlete-woman-b']
  ATHLETES.forEach((athlete, index) => {
    const svg = readFileSync(
      new URL(`../src/assets/athletes/${files[index]}.svg`, import.meta.url),
      'utf8',
    )
    const expected = Array.from({ length: 48 }, () => Array(32).fill(null))
    for (const [, x, y, width, fill] of svg.matchAll(
      /<rect x="(\d+)" y="(\d+)" width="(\d+)" height="1" fill="(#[0-9a-f]{6})"\/>/g,
    ))
      for (let i = 0; i < Number(width); i += 1) expected[y][Number(x) + i] = fill
    const actual = athlete.rows.map((row) =>
      [...row].map((char) =>
        char === '.' ? null : athlete.palette['0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(char)],
      ),
    )
    assert.deepEqual(actual, expected, `${files[index]}: run npm run athletes`)
  })
})

test('movements get the matching animation, with running as the fallback', () => {
  const expected = {
    'Air Squat': 'squat',
    'Goblet Squat': 'squat',
    'Front Squat': 'squat',
    'Push-Up': 'pushup',
    'Pompe inclinée': 'pushup',
    'Mountain Climber': 'climber',
    'Burpee Box Jump': 'burpee',
    'Box Jump': 'jump',
    'Double Under': 'jump',
    'Fente arrière alternée': 'lunge',
    'Sit-Up': 'situp',
    'Dead Bug': 'deadbug',
    Gainage: 'plank',
    'Pull-Up': 'pullup',
    'Toes-to-Bar': 'pullup',
    'Wall Ball': 'wallball',
    Thruster: 'thruster',
    Deadlift: 'hinge',
    'Kettlebell Swing': 'swing',
    'Push Press': 'press',
    'Power Clean': 'press',
    'Jumping Jack': 'jack',
    pompes: 'pushup',
    tractions: 'pullup',
    'Soulevé de terre': 'hinge',
    'Développé militaire': 'press',
    HSPU: 'press',
    Chaise: 'squat',
    'KB swings': 'swing',
    Rameur: 'run',
    'Mouvement inconnu': 'run',
  }
  for (const [name, move] of Object.entries(expected))
    assert.equal(movementAnimation(name), move, name)
})

test('every move loops smoothly through valid poses, and side views stay on the floor', () => {
  for (const move of Object.keys(POSES)) {
    let previous = null
    for (let step = 0; step <= 200; step += 1) {
      const pose = poseAt(move, step / 200)
      if (pose.side) {
        assert.ok(SIDE_POSES[pose.side], `${move}: ${pose.side}`)
        previous = null
        continue
      }
      for (const name of Object.keys(NEUTRAL))
        assert.ok(Number.isFinite(pose[name]), `${move} ${name} at ${step}`)
      // Eased motion: no part jumps more than a few pixels in 1/200 of a loop.
      if (previous)
        for (const name of ['y', 'drop', 'liftL', 'liftR', 'sL', 'sR'])
          assert.ok(Math.abs(pose[name] - previous[name]) < 3, `${move} ${name} jumps at ${step}`)
      previous = pose
    }
  }
  for (const name of Object.keys(SIDE_POSES))
    for (const athlete of ATHLETES) {
      const bottom = Math.max(...sidePixels(athlete, name).map((p) => p.y))
      assert.equal(bottom, 46, `${name} touches the floor`)
    }
})

test('hands hold the bar: pull-ups stay hooked, the barbell follows the press', () => {
  for (let step = 0; step <= 100; step += 1) {
    const hang = poseAt('pullup', step / 100)
    assert.ok(Math.abs(handY(hang, 'L') + 6) < 0.6, `pull-up hands at ${step}`)
    const press = poseAt('press', step / 100)
    assert.equal(propY('bar', press), (handY(press, 'L') + handY(press, 'R')) / 2)
  }
  assert.ok(propY('bar', poseAt('press', 0.5)) < 4, 'bar locked out overhead')
  assert.ok(propY('bar', poseAt('press', 0)) > 12, 'bar racked on the shoulders')
})

test('a name always gets the same athlete', () => {
  assert.equal(athleteIndexFor('Léa', 4), athleteIndexFor('léa', 4))
  for (const name of ['Léa', 'Tom', 'Inès', 'Max'])
    assert.ok(athleteIndexFor(name, 4) < 4)
})
