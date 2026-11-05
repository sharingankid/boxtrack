import { movementDetail } from '../services/sessionAdapter.js'
import { FORMAT_LABELS, withoutDashes } from '../lib/format.js'
import { FORMAT_CUES } from '../lib/training.js'
import { isFrontMove } from '../lib/athletePoses.js'
import { movementAnimation } from '../lib/movementAnimation.js'
import { ATHLETES } from '../data/athletes.js'
import PixelAthlete from './PixelAthlete.jsx'

function PhaseHeader({ index, title, move, athlete }) {
  return (
    <header className="phase-header">
      <span className="phase-step">{index}</span>
      <h3>{title}</h3>
      <PixelAthlete
        className="phase-athlete"
        athlete={athlete}
        move={move}
        view={isFrontMove(move) ? 'compact' : 'side'}
      />
    </header>
  )
}

function Movements({ items = [] }) {
  const named = items.filter((item) => item.movement_name?.trim())
  if (!named.length) return null
  return (
    <ul className="phase-movements">
      {named.map((item, index) => (
        <li key={`${item.movement_name}-${index}`}>
          <b>{item.movement_name}</b>
          <small>{movementDetail(item)}</small>
        </li>
      ))}
    </ul>
  )
}

// The three phases of a session, each in its own card: Warm-Up, Skill /
// Strength (when there is one) and the WOD with its format in front.
export default function SessionPhases({ session }) {
  const strength = session.skill_strength
  const wod = session.wod
  const general = withoutDashes(session.warmup?.general)
  const specific = withoutDashes(session.warmup?.specific)
  return (
    <div className="session-phases">
      <section className="phase-card">
        <PhaseHeader index="1" title="Échauffement" move="jack" athlete={ATHLETES[2]} />
        {general && (
          <>
            <h4>Général</h4>
            <p>{general}</p>
          </>
        )}
        {specific && (
          <>
            <h4>Spécifique</h4>
            <p>{specific}</p>
          </>
        )}
        {!general && !specific && <p className="muted">Le coach te guide sur place.</p>}
      </section>
      {strength && (
        <section className="phase-card">
          <PhaseHeader
            index="2"
            title={strength.kind === 'strength' ? 'Force' : 'Technique'}
            move={movementAnimation(strength.movements?.[0]?.movement_name || 'press')}
            athlete={ATHLETES[1]}
          />
          <Movements items={strength.movements} />
          {strength.instructions && <p className="muted">{withoutDashes(strength.instructions)}</p>}
        </section>
      )}
      {wod && (
        <section className="phase-card is-wod">
          <PhaseHeader
            index={strength ? '3' : '2'}
            title="WOD"
            move={movementAnimation(wod.movements?.[0]?.movement_name || 'run')}
            athlete={ATHLETES[0]}
          />
          <div className="phase-format">
            <strong>{FORMAT_LABELS[wod.format] || 'WOD'}</strong>
            {wod.duration_or_target && <span>{wod.duration_or_target}</span>}
          </div>
          {FORMAT_CUES[wod.format] && <p className="muted">{FORMAT_CUES[wod.format]}</p>}
          <Movements items={wod.movements} />
          {wod.notes && (
            <blockquote>
              <small>LE MOT DU COACH</small>
              {withoutDashes(wod.notes)}
            </blockquote>
          )}
        </section>
      )}
    </div>
  )
}
