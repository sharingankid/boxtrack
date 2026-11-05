// Movement poses for the pixel athletes.
// - Front moves animate the mock-up itself: each move is a loop of key poses
//   (arm angles, leg bend, body drop...) that PixelAthlete interpolates with
//   easing, rounding every offset to whole pixels so it stays pixel art.
// - Side moves (push-ups, planks, sit-ups...) switch between side-view figures
//   drawn in the athlete's own colours.
// Sprite coordinates: 32 × 48, feet on the floor at y = 47.

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

// Neutral standing pose. a = arm angle (0 hangs, 180 overhead), k = arm
// length (1 straight, < 1 bent or pointing at the viewer), l = leg length,
// s = feet spread, lift = knee drive, drop / bend = upper body lowered / leaning.
export const NEUTRAL = {
  x: 0, y: 0, drop: 0, bend: 1, head: 0,
  aL: 0, aR: 0, kL: 1, kR: 1,
  lL: 1, lR: 1, sL: 0, sR: 0, liftL: 0, liftR: 0,
  shadow: 1, squash: 1, toss: 0,
}
const expand = ({ a, k, l, s, ...rest }) => ({
  ...(a !== undefined && { aL: a, aR: a }),
  ...(k !== undefined && { kL: k, kR: k }),
  ...(l !== undefined && { lL: l, lR: l }),
  ...(s !== undefined && { sL: s, sR: s }),
  ...rest,
})
// A key pose at `t` (0-1 of the loop); `ease` shapes the move to the next key.
const key = (t, pose = {}, ease = 'inOut') => ({ t, ease, ...NEUTRAL, ...expand(pose) })
const side = (t, name) => ({ t, side: name, shadow: 2.4 })

export const EASE = {
  linear: (u) => u,
  in: (u) => 1 - Math.cos((u * Math.PI) / 2),
  out: (u) => Math.sin((u * Math.PI) / 2),
  inOut: (u) => (1 - Math.cos(u * Math.PI)) / 2,
}

const RACK = { a: 165, k: 0.3 }
const DRIVE = { a: 170, k: 0.6, y: -1 }
const OVERHEAD = { a: 176, k: 1 }
const SQUAT = { l: 0.55, s: 2, drop: 5 }
const ARMS_FRONT = { a: 8, k: 0.45 }
const HINGE = { bend: 0.65, drop: 3, l: 0.88 }
const HANG = { a: 174, y: -8, l: 0.94, shadow: 0.7 }
const LAND = { l: 0.72, s: 1, drop: 3, squash: 0.9, a: 30, dust: true }
const lungeOn = (front, back) => ({
  [`l${front}`]: 0.6, [`s${front}`]: 1, [`l${back}`]: 0.75, drop: 4, a: 6, k: 0.9,
})
const thrusterKeys = (wallBall) => [
  key(0, RACK, 'in'),
  key(0.28, { ...RACK, ...SQUAT }),
  key(0.36, { ...RACK, ...SQUAT }, 'out'),
  key(0.5, DRIVE, 'out'),
  ...(wallBall
    ? [
        key(0.58, { ...OVERHEAD, toss: 2 }, 'out'),
        key(0.7, { ...OVERHEAD, toss: 20 }, 'in'),
        key(0.82, OVERHEAD),
      ]
    : [key(0.62, OVERHEAD), key(0.78, OVERHEAD)]),
  key(0.95, RACK),
]

// ms = length of one loop; prop = what the hands hold; fx = extra effects.
export const POSES = {
  idle: { ms: 2600, keys: [key(0), key(0.5, { drop: 1, a: 3 })] },
  run: {
    ms: 560,
    fx: ['speed'],
    keys: [
      key(0, { y: -1, liftL: -5, lL: 0.8, aR: 24, kR: 0.65, aL: 4 }),
      key(0.25, { squash: 0.96, a: 6, dust: true }),
      key(0.5, { y: -1, liftR: -5, lR: 0.8, aL: 24, kL: 0.65, aR: 4 }),
      key(0.75, { squash: 0.96, a: 6, dust: true }),
    ],
  },
  squat: {
    ms: 1700,
    keys: [
      key(0),
      key(0.12, { a: 6, k: 0.85 }, 'in'),
      key(0.45, { ...SQUAT, ...ARMS_FRONT }),
      key(0.55, { ...SQUAT, ...ARMS_FRONT }, 'out'),
      key(0.82, { y: -1, squash: 1.03 }),
    ],
  },
  lunge: {
    ms: 2300,
    keys: [
      key(0),
      key(0.2, lungeOn('L', 'R')),
      key(0.32, lungeOn('L', 'R')),
      key(0.5),
      key(0.7, lungeOn('R', 'L')),
      key(0.82, lungeOn('R', 'L')),
    ],
  },
  jump: {
    ms: 1150,
    keys: [
      key(0),
      key(0.18, { l: 0.72, s: 1, drop: 3, k: 0.7, a: 12 }, 'out'),
      key(0.32, { y: -6, a: 150, squash: 1.08, shadow: 0.7 }, 'out'),
      key(0.48, { y: -12, a: 165, l: 0.9, shadow: 0.5 }, 'in'),
      key(0.62, { y: -5, a: 120, squash: 1.05, shadow: 0.75 }, 'in'),
      key(0.72, LAND, 'out'),
      key(0.88, { a: 4 }),
    ],
  },
  jack: {
    ms: 900,
    keys: [
      key(0),
      key(0.15, { y: -3, s: 1.5, a: 80 }),
      key(0.32, { s: 3, a: 170, squash: 0.95, dust: true }),
      key(0.5, { s: 3, a: 170 }),
      key(0.65, { y: -3, s: 1.5, a: 80 }),
      key(0.82, { squash: 0.95, dust: true }),
    ],
  },
  press: {
    ms: 1900,
    prop: 'bar',
    keys: [
      key(0, RACK, 'out'),
      key(0.12, { ...RACK, l: 0.9, drop: 1 }, 'out'),
      key(0.22, DRIVE, 'out'),
      key(0.4, OVERHEAD),
      key(0.6, OVERHEAD),
      key(0.85, RACK),
    ],
  },
  thruster: { ms: 2100, prop: 'bar', keys: thrusterKeys(false) },
  wallball: { ms: 2300, prop: 'ball', keys: thrusterKeys(true) },
  hinge: {
    ms: 2000,
    prop: 'bar',
    keys: [key(0), key(0.3, HINGE, 'out'), key(0.42, HINGE), key(0.72)],
  },
  swing: {
    ms: 1300,
    prop: 'kb',
    keys: [
      key(0, { ...HINGE, l: 0.85 }, 'out'),
      key(0.42, { k: 0.3, a: 4 }),
      key(0.55, { k: 0.32, a: 4 }, 'in'),
      key(0.9, { ...HINGE, l: 0.85 }),
    ],
  },
  pullup: {
    ms: 1900,
    pullBar: true,
    keys: [
      key(0, HANG, 'out'),
      key(0.35, { ...HANG, y: -20, k: 0.25, l: 0.86, shadow: 0.5 }),
      key(0.5, { ...HANG, y: -20, k: 0.25, l: 0.86, shadow: 0.5 }),
      key(0.85, HANG),
    ],
  },
  pushup: {
    ms: 1500,
    keys: [
      side(0, 'plankHigh'),
      side(0.3, 'pushupMid'),
      side(0.42, 'pushupLow'),
      side(0.58, 'pushupMid'),
      side(0.7, 'plankHigh'),
    ],
  },
  climber: {
    ms: 720,
    keys: [
      side(0, 'climberA'),
      side(0.25, 'plankHigh'),
      side(0.5, 'climberB'),
      side(0.75, 'plankHigh'),
    ],
  },
  plank: { ms: 2600, keys: [side(0, 'plank'), side(0.5, 'plankHips')] },
  situp: {
    ms: 1700,
    keys: [
      side(0, 'situpDown'),
      side(0.3, 'situpMid'),
      side(0.42, 'situpUp'),
      side(0.6, 'situpMid'),
      side(0.75, 'situpDown'),
    ],
  },
  deadbug: {
    ms: 1800,
    keys: [side(0, 'deadbugA'), side(0.4, 'deadbugB'), side(0.7, 'deadbugA')],
  },
  burpee: {
    ms: 2800,
    keys: [
      key(0),
      key(0.1, { ...SQUAT, k: 0.5, a: 30 }),
      side(0.18, 'plankHigh'),
      side(0.3, 'pushupMid'),
      side(0.36, 'pushupLow'),
      side(0.44, 'pushupMid'),
      side(0.5, 'plankHigh'),
      key(0.58, { ...SQUAT, k: 0.5, a: 30 }, 'out'),
      key(0.68, { y: -12, a: 170, squash: 1.08, shadow: 0.5 }, 'in'),
      key(0.8, LAND, 'out'),
      key(0.92),
    ],
  },
  celebrate: {
    ms: 1000,
    fx: ['confetti'],
    keys: [
      key(0, { a: 150 }, 'out'),
      key(0.3, { y: -7, a: 168, squash: 1.06, shadow: 0.6 }, 'in'),
      key(0.55, { a: 155, squash: 0.92, dust: true }, 'out'),
      key(0.7, { a: 150 }),
    ],
  },
}

// Front moves show the mock-up itself; side moves use the drawn side view.
export const isFrontMove = (move) =>
  (POSES[move] || POSES.idle).keys.every((pose) => !pose.side)

// The pose at `fraction` (0-1) of the loop: eased between the two key poses
// around it. A side key is held until the next key.
export function poseAt(move, fraction) {
  const { keys } = POSES[move] || POSES.idle
  const f = ((fraction % 1) + 1) % 1
  let index = 0
  keys.forEach((pose, i) => {
    if (pose.t <= f) index = i
  })
  const from = keys[index]
  const to = keys[(index + 1) % keys.length]
  if (from.side) return { side: from.side, shadow: from.shadow }
  if (to.side) return { ...from }
  const end = index + 1 < keys.length ? to.t : 1
  const u = end > from.t ? (f - from.t) / (end - from.t) : 0
  const e = EASE[from.ease](u)
  const pose = {}
  for (const name of Object.keys(NEUTRAL))
    pose[name] = from[name] + (to[name] - from[name]) * e
  return pose
}

// Age (ms) of each dust puff still visible: puffs start on keys marked `dust`.
export function dustAges(move, fraction, life = 450) {
  const { keys, ms } = POSES[move] || POSES.idle
  return keys
    .filter((pose) => pose.dust)
    .map((pose) => ((((fraction - pose.t) % 1) + 1) % 1) * ms)
    .filter((age) => age < life)
}

// Where the hands are (y), from the arm angle and length of that side.
export function handY(pose, sideName = 'L') {
  const angle = (pose[`a${sideName}`] * Math.PI) / 180
  const local = 18 + 16 * pose[`k${sideName}`] * Math.cos(angle)
  return pose.y + pose.drop + 34 + (local - 34) * pose.bend
}

// Held objects follow the hands: a bar in them, a kettlebell hanging below,
// a medicine ball on the chest when racked and above the hands when tossed.
export function propY(kind, pose) {
  const hands = (handY(pose, 'L') + handY(pose, 'R')) / 2
  if (kind === 'kb') return hands + 4
  if (kind === 'ball') {
    const racked = Math.min(1, Math.max(0, (1 - pose.kL) / 0.7))
    return hands - 3 + 9 * racked - pose.toss
  }
  return hands
}

export function pivotsOf(athlete) {
  const [left, right] = athlete.arms
  return {
    sl: [left - 2, 18],
    sr: [right + 2, 18],
    hip: [16, 34],
    footL: [12, 47],
    footR: [19, 47],
  }
}

// ---- Side views -----------------------------------------------------------
// Shapes are [colour, col0, row0, col1, row1] rectangles (inclusive) on a grid
// facing right, whose row 15 stands on the floor. x = col - 6, y = row + 30.
// Colours: h hair, k skin, K far-side skin, t top, a belly, b shorts, f shoes,
// e eye. The dark outline is added around everything, like the front sprites.
const headRight = (c, r0) => [
  ['k', c, r0 + 4, c, r0 + 6],
  ['h', c + 1, r0, c + 7, r0 + 1],
  ['h', c + 1, r0 + 2, c + 1, r0 + 4],
  ['k', c + 2, r0 + 2, c + 7, r0 + 6],
  ['e', c + 5, r0 + 3, c + 5, r0 + 3],
]
const headUp = (c, r0) => [
  ['h', c, r0 + 4, c + 6, r0 + 6],
  ['h', c, r0, c, r0 + 3],
  ['k', c + 1, r0, c + 6, r0 + 3],
  ['e', c + 4, r0 + 1, c + 4, r0 + 1],
  ['k', c + 7, r0 + 3, c + 7, r0 + 4],
]
const plankLegs = (skin) => [
  ['f', 1, 12, 3, 15],
  [skin, 4, 11, 8, 13],
  [skin, 9, 10, 12, 12],
  [skin, 13, 9, 16, 11],
]
const kneeIn = (skin) => [
  [skin, 19, 10, 22, 12],
  [skin, 23, 11, 25, 12],
  [skin, 24, 13, 26, 13],
  [skin, 23, 14, 25, 14],
  ['f', 22, 15, 25, 15],
]
const plankBody = [
  ['b', 17, 8, 21, 11],
  ['a', 22, 7, 26, 11],
  ['t', 27, 6, 31, 10],
  ...headRight(32, 2),
  ['k', 30, 9, 31, 14],
  ['k', 30, 15, 32, 15],
]
const lyingBody = [
  ...headUp(2, 9),
  ['t', 10, 11, 15, 15],
  ['a', 16, 11, 21, 15],
  ['b', 22, 11, 26, 15],
]
const bentLegs = [
  ['k', 27, 10, 28, 12],
  ['k', 29, 8, 30, 10],
  ['k', 31, 6, 32, 8],
  ['k', 32, 9, 33, 11],
  ['k', 33, 12, 34, 13],
  ['f', 33, 14, 36, 15],
]
const tabletop = (skin) => [
  [skin, 24, 4, 26, 10],
  [skin, 27, 4, 32, 6],
  ['f', 33, 3, 35, 6],
]

export const SIDE_POSES = {
  plankHigh: [...plankLegs('k'), ...plankBody],
  pushupLow: [
    ['f', 1, 13, 3, 15],
    ['k', 4, 12, 10, 14],
    ['k', 11, 11, 16, 13],
    ['b', 17, 10, 21, 13],
    ['a', 22, 9, 26, 13],
    ['t', 27, 9, 31, 13],
    ...headRight(32, 5),
    ['k', 26, 11, 29, 11],
    ['k', 29, 12, 30, 14],
    ['k', 29, 15, 31, 15],
  ],
  pushupMid: [
    ['f', 1, 12, 3, 15],
    ['k', 4, 11, 9, 13],
    ['k', 10, 10, 16, 12],
    ['b', 17, 9, 21, 12],
    ['a', 22, 8, 26, 12],
    ['t', 27, 8, 31, 12],
    ...headRight(32, 4),
    ['k', 28, 12, 30, 12],
    ['k', 30, 13, 31, 14],
    ['k', 30, 15, 32, 15],
  ],
  climberA: [...plankLegs('K'), ...plankBody, ...kneeIn('k')],
  climberB: [...kneeIn('K'), ...plankLegs('k'), ...plankBody],
  plank: [
    ['f', 1, 12, 3, 15],
    ['k', 4, 11, 16, 13],
    ['b', 17, 10, 21, 13],
    ['a', 22, 9, 26, 13],
    ['t', 27, 9, 31, 13],
    ...headRight(32, 6),
    ['k', 29, 13, 30, 14],
    ['k', 29, 15, 36, 15],
  ],
  plankHips: [
    ['f', 1, 12, 3, 15],
    ['k', 4, 11, 9, 13],
    ['k', 10, 10, 16, 12],
    ['b', 17, 9, 21, 12],
    ['a', 22, 9, 26, 13],
    ['t', 27, 9, 31, 13],
    ...headRight(32, 6),
    ['k', 29, 13, 30, 14],
    ['k', 29, 15, 36, 15],
  ],
  situpDown: [...lyingBody, ...bentLegs, ['k', 12, 9, 17, 10]],
  situpMid: [
    ['b', 22, 11, 26, 15],
    ['a', 17, 10, 21, 14],
    ['t', 12, 8, 17, 12],
    ...headUp(5, 4),
    ...bentLegs,
    ['k', 14, 7, 19, 8],
  ],
  situpUp: [
    ['b', 21, 12, 26, 15],
    ['a', 20, 8, 24, 11],
    ['t', 21, 4, 25, 7],
    ...headRight(25, -3),
    ...bentLegs,
    ['k', 24, 6, 30, 7],
  ],
  deadbugA: [...lyingBody, ['k', 13, 3, 14, 10], ...tabletop('k')],
  deadbugB: [
    ['K', 13, 3, 14, 10],
    ...tabletop('K'),
    ...lyingBody,
    ['k', 3, 7, 12, 8],
    ['k', 27, 10, 31, 12],
    ['k', 32, 11, 36, 13],
    ['f', 37, 10, 39, 13],
  ],
}

const sample = (athlete, x, y) =>
  athlete.palette[DIGITS.indexOf(athlete.rows[y][x])]

export function sideColours(athlete) {
  const skin = sample(athlete, 13, 6)
  const shade = sample(athlete, 14, 9)
  const top = sample(athlete, 12, 20)
  return {
    o: sample(athlete, 12, 1),
    e: sample(athlete, 12, 1),
    h: sample(athlete, 13, 2),
    k: skin,
    K: shade,
    t: top,
    // The women's sprites wear a crop top: their belly is skin.
    a: athlete.id.startsWith('woman') ? skin : top,
    b: sample(athlete, 12, 31),
    f: sample(athlete, 12, 44),
  }
}

const sideCache = new Map()
// Rasterise a side pose, outline it, and merge each row into runs.
export function sidePixels(athlete, name) {
  const key = `${athlete.id}:${name}`
  if (sideCache.has(key)) return sideCache.get(key)
  const colours = sideColours(athlete)
  const width = 46
  const top = -6
  const height = 23
  const grid = Array.from({ length: height }, () => Array(width).fill(null))
  for (const [code, c0, r0, c1, r1] of SIDE_POSES[name])
    for (let row = r0; row <= r1; row += 1)
      for (let col = c0; col <= c1; col += 1)
        grid[row - top][col + 1] = colours[code]
  const outlined = grid.map((line, y) =>
    line.map(
      (cell, x) =>
        cell ||
        ([
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ].some(([nx, ny]) => grid[ny]?.[nx])
          ? colours.o
          : null),
    ),
  )
  const pixels = []
  outlined.forEach((line, y) => {
    let x = 0
    while (x < width) {
      if (!line[x]) {
        x += 1
        continue
      }
      let end = x + 1
      while (end < width && line[end] === line[x]) end += 1
      pixels.push({ x: x - 1 - 6, y: y + top + 30, width: end - x, fill: line[x] })
      x = end
    }
  })
  sideCache.set(key, pixels)
  return pixels
}
