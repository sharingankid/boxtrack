import { useMemo } from 'react'
import { generate } from 'lean-qr/nano'

// A QR code drawn as crisp SVG modules (dark on white, with its quiet zone).
export default function QrCode({ value, label, className = '' }) {
  const runs = useMemo(() => {
    const code = generate(value)
    const list = []
    for (let y = 0; y < code.size; y += 1) {
      let x = 0
      while (x < code.size) {
        if (!code.get(x, y)) {
          x += 1
          continue
        }
        let end = x + 1
        while (end < code.size && code.get(end, y)) end += 1
        list.push({ x, y, width: end - x })
        x = end
      }
    }
    return { size: code.size, list }
  }, [value])
  return (
    <svg
      className={`qr-code ${className}`}
      viewBox={`-4 -4 ${runs.size + 8} ${runs.size + 8}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
    >
      <rect x="-4" y="-4" width={runs.size + 8} height={runs.size + 8} fill="#fff" />
      {runs.list.map((run) => (
        <rect
          key={`${run.x}-${run.y}`}
          x={run.x}
          y={run.y}
          width={run.width}
          height="1"
          fill="#0d0d0d"
        />
      ))}
    </svg>
  )
}
