import { useState } from 'react'

function FlipDigit({ value }) {
  const [digits, setDigits] = useState({ value, previous: value })
  if (digits.value !== value) setDigits({ value, previous: digits.value })
  return <span className="flip-digit">
    <span className="flip-half flip-top"><span>{value}</span></span>
    <span className="flip-half flip-bottom"><span>{value}</span></span>
    {digits.previous !== value && <span className="flip-transition" key={value}>
      <span className="flip-half flip-bottom"><span>{digits.previous}</span></span>
      <span className="flip-half flip-top flip-leaf-top"><span>{digits.previous}</span></span>
      <span className="flip-half flip-bottom flip-leaf-bottom"><span>{value}</span></span>
    </span>}
    <i className="flip-hinge flip-hinge-left" /><i className="flip-hinge flip-hinge-right" />
  </span>
}

export function ArcadeClock({ now }) {
  return <div className="flip-clock" role="img" aria-label={`Heure actuelle : ${now.time}`}>
    <div className="flip-digits" aria-hidden="true">{now.time.split('').map((digit, index) => digit === ':'
      ? <span className="flip-colon" key={index}>:</span>
      : <FlipDigit value={digit} key={index} />)}</div>
  </div>
}

// Twelve poses keep the planted foot on the track while the knee folds on recovery.
// The second leg follows half a cycle behind; arms swing opposite their leg.
const LEG_POSES = [
  [[21, 24], [24, 29]], // reaching for contact
  [[19, 25], [20, 28]], // landing, body compresses by one pixel
  [[15, 25], [15, 29]], // weight passes over the planted foot
  [[12, 24], [9, 30]],  // push-off
  [[10, 22], [6, 26]],  // heel lifts
  [[12, 21], [9, 22]],  // heel folds toward the hip
  [[16, 22], [12, 20]],
  [[20, 22], [16, 21]],
  [[22, 22], [20, 24]], // knee drives forward
  [[23, 23], [25, 26]],
  [[22, 23], [26, 28]],
  [[22, 24], [25, 30]],
]
const ARM_POSES = [
  [[12, 15], [9, 12]], [[12, 16], [9, 14]],
  [[13, 17], [10, 16]], [[15, 17], [13, 18]],
  [[18, 17], [19, 15]], [[21, 16], [23, 12]],
  [[22, 15], [25, 11]], [[22, 15], [25, 12]],
  [[21, 16], [24, 13]], [[19, 17], [21, 16]],
  [[16, 17], [16, 18]], [[14, 16], [11, 15]],
]
const BOUNCE = [0, 1, 0, -1, -2, -2, 0, 1, 0, -1, -2, -2]
const points = (origin, joints) => [origin, ...joints].map(point => point.join(',')).join(' ')

export function PixelRunner() {
  return <svg className="pixel-runner" viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
    <ellipse className="runner-shadow" cx="16" cy="30" rx="9" ry="1" fill="#000" opacity=".35" />
    <path className="runner-dust" d="M3 28h3v2H3z" fill="#ff9867" />
    <path className="runner-dust runner-dust-two" d="M0 26h2v2H0z" fill="#ffca99" />
    {LEG_POSES.map((leg, index) => {
      const opposite = (index + 6) % LEG_POSES.length
      const backLeg = LEG_POSES[opposite]
      return <g className="runner-frame" key={index} style={{ '--frame': index }}>

      <g transform={`translate(0 ${BOUNCE[index]})`}>
        <polyline points={points([17, 12], ARM_POSES[opposite])} fill="none" stroke="#bb784f" strokeWidth="3" />
        <polyline points={points([15, 19], backLeg)} fill="none" stroke="#bb784f" strokeWidth="3" />
        <path d={`M${backLeg[1].join(',')}h4v2h-4z`} fill="#b8b7ab" />
        <path className="runner-ribbon" d="M15 5h-5v2h5z" fill="#ff7139" />
        <path fill="#ffca99" d="M16 3h7v6h-7zM16 8h4v4h-4z" />
        <path fill="#29202b" d="M15 2h8v3h-8zM14 4h3v3h-3z" />
        <path fill="#ff7139" d="M15 4h9v2h-9z" />
        <path fill="#201a18" d="M21 6h1v1h-1z" />
        <path fill="#fff3d6" d="M14 10h6v5h-2v4h-6v-5h2z" />
        <path fill="#ff7139" d="M12 17h7v4h-7z" />
        <polyline points={points([15, 19], leg)} fill="none" stroke="#ffca99" strokeWidth="3" />
        <path d={`M${leg[1].join(',')}h4v2h-4z`} fill="#fff3d6" />
        <polyline points={points([17, 12], ARM_POSES[index])} fill="none" stroke="#ffca99" strokeWidth="3" />
      </g>
    </g>})}
  </svg>
}
