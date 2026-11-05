// Rebuilds src/data/athletes.js from the pixel-art mock-ups in
// src/assets/athletes/*.svg (32 × 48, one <rect> per run of pixels).
// Run after editing a mock-up: npm run athletes
import { readFileSync, writeFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'
// `arms` = last column of the left arm and first column of the right arm.
const ATHLETES = [
  ['manA', 'athlete-man-a', 'Débardeur orange', [7, 24]],
  ['manB', 'athlete-man-b', 'Débardeur noir', [7, 24]],
  ['womanA', 'athlete-woman-a', 'Brassière orange', [8, 23]],
  ['womanB', 'athlete-woman-b', 'Brassière noire', [8, 23]],
]

function spriteOf(svg) {
  const grid = Array.from({ length: 48 }, () => Array(32).fill(null))
  for (const [, x, y, width, fill] of svg.matchAll(
    /<rect x="(\d+)" y="(\d+)" width="(\d+)" height="1" fill="(#[0-9a-f]{6})"\/>/g,
  ))
    for (let i = 0; i < Number(width); i += 1) grid[y][Number(x) + i] = fill
  const palette = []
  const rows = grid.map((line) =>
    line
      .map((fill) => {
        if (!fill) return '.'
        if (!palette.includes(fill)) palette.push(fill)
        return DIGITS[palette.indexOf(fill)]
      })
      .join(''),
  )
  return { palette, rows }
}

const lines = [
  '// Pixel athletes generated from the mock-ups in src/assets/athletes/*.svg',
  '// by scripts/athletes-from-svg.mjs (npm run athletes) - do not edit by hand.',
  "// One character per pixel: '.' is transparent, any other character is an index",
  '// in `palette` (0-9 then a-z). `arms` = last column of the left arm and first',
  '// column of the right arm, so the arms can be animated on their own.',
  'export const ATHLETES = [',
]
for (const [id, file, label, arms] of ATHLETES) {
  const svg = readFileSync(new URL(`src/assets/athletes/${file}.svg`, root), 'utf8')
  const { palette, rows } = spriteOf(svg)
  lines.push(
    '  {',
    `    id: '${id}',`,
    `    label: '${label}',`,
    `    arms: [${arms.join(', ')}],`,
    `    palette: [${palette.map((colour) => `'${colour}'`).join(', ')}],`,
    '    rows: [',
    ...rows.map((row) => `      '${row}',`),
    '    ],',
    '  },',
  )
}
lines.push(']')
writeFileSync(new URL('src/data/athletes.js', root), `${lines.join('\n')}\n`)
console.log('src/data/athletes.js rebuilt from', ATHLETES.length, 'mock-ups')
