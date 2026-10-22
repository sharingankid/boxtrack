const SEGMENTS = [
  'abcdef',
  'bc',
  'abdeg',
  'abcdg',
  'bcfg',
  'acdfg',
  'acdefg',
  'abc',
  'abcdefg',
  'abcdfg',
]

export function ArcadeClock({ now }) {
  return (
    <div
      className="arcade-clock"
      role="img"
      aria-label={`Heure actuelle : ${now.time}`}
    >
      <span className="arcade-clock-label" aria-hidden="true">
        BOX TIME <i /> LIVE
      </span>
      <div className="arcade-digits" aria-hidden="true">
        {now.time.split('').map((digit, index) =>
          digit === ':' ? (
            <span className="arcade-colon" key={index}>
              :
            </span>
          ) : (
            <span className="arcade-digit" key={index}>
              {'abcdefg'.split('').map((segment) => (
                <i
                  key={segment}
                  className={`segment segment-${segment} ${SEGMENTS[Number(digit)].includes(segment) ? 'lit' : ''}`}
                />
              ))}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

export function PixelRunner() {
  return (
    <svg
      className="pixel-runner"
      viewBox="0 0 24 26"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g className="runner-body">
        <path fill="#ffca99" d="M11 2h6v6h-6zM10 9h4v3h-4z" />
        <path fill="#241b22" d="M10 1h8v3h-8zM16 4h3v2h-3z" />
        <path fill="#fff3d6" d="M9 9h6v8H8v-5h1z" />
        <path fill="#ff7139" d="M8 15h7v4H8z" />
        <g className="runner-arm">
          <path fill="#ffca99" d="M13 10h3v3h4v-3h2v5h-8z" />
        </g>
        <g className="runner-leg runner-leg-back">
          <path fill="#ffca99" d="M9 18h3v4H8v3H4v-3h3v-3h2z" />
          <path fill="#fff3d6" d="M2 23h6v3H2z" />
        </g>
        <g className="runner-leg runner-leg-front">
          <path fill="#ffca99" d="M12 18h3v3h3v3h-3v-2h-3z" />
          <path fill="#fff3d6" d="M15 23h6v3h-6z" />
        </g>
      </g>
    </svg>
  )
}
