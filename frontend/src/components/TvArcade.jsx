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

// Articulated limbs share one stride clock, with opposite arms and legs half a cycle apart.
function RunnerLeg({ back = false }) {
  return <g className={`runner-leg ${back ? 'runner-leg-back' : 'runner-leg-front'}`}>
    <path d="M0 0v6" fill="none" stroke={back ? '#b87953' : '#ffca99'} strokeWidth="3" />
    <g transform="translate(0 6)"><g className="runner-knee">
      <path d="M0 0v6" fill="none" stroke={back ? '#b87953' : '#ffca99'} strokeWidth="3" />
      <g transform="translate(0 6)"><g className="runner-shoe">
        <path d="M-2-1h3v1h3v2h-6z" fill={back ? '#bfc6c4' : '#fff3d6'} />
        <path d="M-2 1h6v1h-6z" fill="#ff7139" />
      </g></g>
    </g></g>
  </g>
}

function RunnerArm({ back = false }) {
  return <g className={`runner-arm ${back ? 'runner-arm-back' : 'runner-arm-front'}`}>
    <path d="M0 0v5h4v-2" fill="none" stroke={back ? '#b87953' : '#ffca99'} strokeWidth="3" />
  </g>
}

export function PixelRunner() {
  return <svg className="pixel-runner" viewBox="0 0 36 36" shapeRendering="crispEdges" aria-hidden="true">
    <ellipse className="runner-shadow" cx="18" cy="33" rx="9" ry="1" fill="#000" opacity=".35" />
    <path className="runner-dust" d="M3 30h3v2H3z" fill="#ff9867" />
    <path className="runner-dust runner-dust-two" d="M0 28h2v2H0z" fill="#ffca99" />
    <g className="runner-rig">
      <g transform="translate(18 14)"><RunnerArm back /></g>
      <g transform="translate(16 20)"><RunnerLeg back /></g>
      <g className="runner-torso" transform="rotate(9 16 20)">
        <path className="runner-ribbon" d="M17 6h-6v2h6z" fill="#ff7139" />
        <path fill="#ffca99" d="M18 4h7v6h-7zM18 9h4v4h-4z" />
        <path fill="#29202b" d="M17 3h8v3h-8zM16 5h3v3h-3z" />
        <path fill="#ff7139" d="M17 5h9v2h-9z" />
        <path fill="#201a18" d="M23 7h1v1h-1z" />
        <path fill="#fff3d6" d="M16 12h6v5h-2v4h-6v-5h2z" />
        <path fill="#d7dfdb" d="M15 17h3v4h-3z" />
        <path fill="#ff7139" d="M14 19h7v4h-7z" />
      </g>
      <g transform="translate(17 20)"><RunnerLeg /></g>
      <g transform="translate(20 14)"><RunnerArm /></g>
    </g>
  </svg>
}
