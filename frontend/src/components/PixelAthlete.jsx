import { useEffect, useState } from 'react'
import { ATHLETES } from '../data/athletes.js'
import {
  POSES,
  dustAges,
  pivotsOf,
  poseAt,
  propY,
  sideColours,
  sidePixels,
} from '../lib/athletePoses.js'

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'
const STEEL = '#b8b8c2'
const IRON = '#26262b'
const ORANGE = '#ff6a1a'
const CONFETTI_COLOURS = ['#ff6a1a', '#f2f2f2', '#ff9b63', '#ffd166']
const CONFETTI = Array.from({ length: 14 }, (_, index) => ({
  angle: ((-160 + index * (140 / 13)) * Math.PI) / 180,
  speed: 16 + (index % 3) * 6,
  fill: CONFETTI_COLOURS[index % CONFETTI_COLOURS.length],
}))

// One shared animation clock (about 30 fps) for every athlete on the page.
const listeners = new Set()
let frameId = null
let last = 0
function loop(now) {
  if (now - last >= 33) {
    last = now
    listeners.forEach((listener) => listener(now))
  }
  frameId = listeners.size ? requestAnimationFrame(loop) : null
}
function useAnimationTime(enabled) {
  const [time, setTime] = useState(0)
  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    listeners.add(setTime)
    if (!frameId) frameId = requestAnimationFrame(loop)
    return () => listeners.delete(setTime)
  }, [enabled])
  return time
}

// Split the front sprite into horizontal runs, grouped by body part so each
// part can be moved around its joint (shoulders, hips, feet). The <rect>
// elements are built once per athlete: animation only changes transforms.
const partCache = new Map()
const rects = (list) =>
  list.map((pixel) => (
    <rect
      key={`${pixel.x}-${pixel.y}`}
      x={pixel.x}
      y={pixel.y}
      width={pixel.width}
      height="1"
      fill={pixel.fill}
    />
  ))
function partsOf(athlete) {
  if (partCache.has(athlete.id)) return partCache.get(athlete.id)
  const [leftArm, rightArm] = athlete.arms
  const partAt = (x, y) =>
    y >= 35
      ? x <= 15
        ? 'legL'
        : 'legR'
      : y >= 18 && x <= leftArm
        ? 'armL'
        : y >= 18 && x >= rightArm
          ? 'armR'
          : y <= 14
            ? 'head'
            : 'torso'
  const parts = { legL: [], legR: [], torso: [], head: [], armL: [], armR: [] }
  athlete.rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const char = row[x]
      if (char === '.') {
        x += 1
        continue
      }
      const part = partAt(x, y)
      let end = x + 1
      while (end < row.length && row[end] === char && partAt(end, y) === part)
        end += 1
      parts[part].push({ x, y, width: end - x, fill: athlete.palette[DIGITS.indexOf(char)] })
      x = end
    }
  })
  const elements = Object.fromEntries(
    Object.entries(parts).map(([name, list]) => [name, rects(list)]),
  )
  partCache.set(athlete.id, elements)
  return elements
}
const sideCache = new Map()
function sideOf(athlete, name) {
  const cacheKey = `${athlete.id}:${name}`
  if (!sideCache.has(cacheKey)) sideCache.set(cacheKey, rects(sidePixels(athlete, name)))
  return sideCache.get(cacheKey)
}

const round = Math.round
const t = (x, y) => `translate(${round(x)} ${round(y)})`
const r = (angle, [x, y]) => `rotate(${round(angle)} ${x} ${y})`
const s = (sx, sy, [x, y]) =>
  `translate(${x} ${y}) scale(${sx.toFixed(2)} ${sy.toFixed(2)}) translate(${-x} ${-y})`

function Prop({ kind, y }) {
  y = round(y)
  if (kind === 'bar')
    return (
      <g>
        <rect x="-4" y={y} width="40" height="1" fill={STEEL} />
        <rect x="-6" y={y - 3} width="2" height="7" fill={IRON} />
        <rect x="36" y={y - 3} width="2" height="7" fill={IRON} />
        <rect x="-4" y={y - 2} width="1" height="5" fill={ORANGE} />
        <rect x="35" y={y - 2} width="1" height="5" fill={ORANGE} />
      </g>
    )
  if (kind === 'ball')
    return (
      <g>
        <rect x="13" y={y - 4} width="7" height="1" fill={IRON} />
        <rect x="12" y={y - 3} width="9" height="5" fill={ORANGE} />
        <rect x="12" y={y - 1} width="9" height="1" fill={IRON} />
        <rect x="13" y={y + 2} width="7" height="1" fill={IRON} />
      </g>
    )
  // Kettlebell: lighter metal so it stays visible in front of dark shorts.
  return (
    <g>
      <rect x="13" y={y - 4} width="7" height="5" fill={IRON} />
      <rect x="14" y={y - 3} width="5" height="1" fill={STEEL} />
      <rect x="14" y={y - 2} width="1" height="2" fill={STEEL} />
      <rect x="18" y={y - 2} width="1" height="2" fill={STEEL} />
      <rect x="11" y={y - 1} width="11" height="7" fill={IRON} />
      <rect x="12" y={y} width="9" height="5" fill="#6b6b78" />
      <rect x="13" y={y + 1} width="2" height="1" fill={STEEL} />
    </g>
  )
}

// What the SVG frames: room for jumps and props, the standing mock-up only,
// or the strip where side views (push-ups, planks...) lie.
const VIEWS = { full: '-8 -22 48 70', compact: '0 0 32 48', side: '-8 24 48 24' }

// One of Panaki's pixel athletes doing `move` (see lib/athletePoses.js).
// `phase` offsets the loop so a group isn't in sync, `still` freezes the
// first pose, `at` shows a given point of the loop (0-1), `sweat` adds drops
// after a long effort, `view` picks the frame (VIEWS; `compact` = 'compact').
export default function PixelAthlete({
  athlete = ATHLETES[0],
  move = 'idle',
  phase = 0,
  still = false,
  at,
  sweat = false,
  compact = false,
  view = compact ? 'compact' : 'full',
  className = '',
}) {
  const definition = POSES[move] || POSES.idle
  const time = useAnimationTime(!still && at === undefined)
  const fraction = at ?? (time + phase * definition.ms * 0.37) / definition.ms
  const pose = poseAt(move, fraction)
  const parts = partsOf(athlete)
  const p = pivotsOf(athlete)
  const colours = sideColours(athlete)
  const shadow = pose.shadow ?? 1
  const blinking = time > 0 && (time + phase * 733) % 3400 < 130
  const squash = pose.squash ?? 1
  const fx = definition.fx || []

  return (
    <svg
      className={`pixel-athlete is-${move} view-${view} ${className}`}
      viewBox={VIEWS[view] || VIEWS.full}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {definition.pullBar && (
        <g>
          <rect x="-7" y="-6" width="46" height="1" fill={STEEL} />
          <rect x="-7" y="-6" width="1" height="53" fill="#41414b" />
          <rect x="38" y="-6" width="1" height="53" fill="#41414b" />
        </g>
      )}
      <rect
        x={round(16 - 8 * shadow)}
        y="47"
        width={round(16 * shadow)}
        height="1"
        fill="#000"
        opacity=".4"
      />
      {fx.includes('speed') &&
        [20, 28, 36].map((y, index) => {
          const offset = ((time / 12 + index * 7) % 12) | 0
          return (
            <rect
              key={y}
              x={-3 - offset}
              y={y}
              width="4"
              height="1"
              fill="#ff9b63"
              opacity={0.55 - offset / 30}
            />
          )
        })}
      {pose.side ? (
        <g>{sideOf(athlete, pose.side)}</g>
      ) : (
        <g transform={`${t(pose.x, pose.y)} ${s(1 + (1 - squash) * 0.6, squash, [16, 47])}`}>
          <g transform={`${t(-pose.sL, pose.liftL)} ${s(1, pose.lL, p.footL)}`}>{parts.legL}</g>
          <g transform={`${t(pose.sR, pose.liftR)} ${s(1, pose.lR, p.footR)}`}>{parts.legR}</g>
          <g transform={`${t(0, pose.drop)} ${s(1, pose.bend, p.hip)}`}>
            <g>{parts.torso}</g>
            <g transform={t(0, pose.head)}>
              {parts.head}
              {blinking && (
                <g fill={colours.k}>
                  <rect x="12" y="7" width="1" height="1" />
                  <rect x="19" y="7" width="1" height="1" />
                </g>
              )}
              {sweat && time % 1500 < 900 && (
                <rect x="24" y={6 + round(((time % 1500) / 900) * 12)} width="1" height="2" fill="#9fd8ff" />
              )}
            </g>
            <g transform={`${r(pose.aL, p.sl)} ${s(1, pose.kL, p.sl)}`}>{parts.armL}</g>
            <g transform={`${r(-pose.aR, p.sr)} ${s(1, pose.kR, p.sr)}`}>{parts.armR}</g>
          </g>
          {definition.prop && <Prop kind={definition.prop} y={propY(definition.prop, pose)} />}
        </g>
      )}
      {dustAges(move, fraction).map((age) => {
        const spread = round(age / 70)
        const rise = round(age / 160)
        const size = age < 220 ? 2 : 1
        return (
          <g key={age} fill="#d9d2c6" opacity={1 - age / 450}>
            <rect x={7 - spread} y={45 - rise} width={size} height={size} />
            <rect x={24 + spread} y={45 - rise} width={size} height={size} />
          </g>
        )
      })}
      {fx.includes('confetti') &&
        CONFETTI.map((piece, index) => {
          const tau = (fraction + (index % 4) * 0.08) % 1
          // The burst starts above the head so it never covers the face.
          if (tau < 0.06) return null
          return (
            <rect
              key={index}
              x={round(16 + Math.cos(piece.angle) * piece.speed * tau)}
              y={round(-10 + Math.sin(piece.angle) * piece.speed * tau + 26 * tau * tau)}
              width={tau < 0.6 ? 2 : 1}
              height={tau < 0.6 ? 2 : 1}
              fill={piece.fill}
              opacity={1 - tau}
            />
          )
        })}
    </svg>
  )
}
