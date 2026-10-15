import { movementDetail } from '../services/sessionAdapter.js'
import { FORMAT_LABELS } from '../lib/format.js'
import LoadHelper from './LoadHelper.jsx'

function MovementList({ movements = [] }) {
  if (!movements.length) return <p className="muted">Aucun mouvement renseigné.</p>
  return <ol className="movement-list">{movements.map((item, index) => (
    <li key={`${item.movement_name}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.movement_name}</strong><small>{movementDetail(item)}</small><LoadHelper name={item.movement_name} detail={movementDetail(item)} /></li>
  ))}</ol>
}

export default function SessionDetailContent({ session }) {
  return (
    <div className="detail-grid">
      <section className="phase-card warmup">
        <p className="eyebrow">Mise en route</p><h2>Warm-Up</h2>
        <h3>Général</h3><p>{session.warmup?.general || 'Non renseigné'}</p>
        <h3>Spécifique</h3><p>{session.warmup?.specific || 'Non renseigné'}</p>
      </section>
      <section className="phase-card skill">
        <p className="eyebrow">Technique & force</p><h2>{session.skill_strength?.kind === 'strength' ? 'Strength' : 'Skill'}</h2>
        <p>{session.skill_strength?.instructions || 'Pas de bloc Skill / Strength pour cette séance.'}</p>
        <MovementList movements={session.skill_strength?.movements} />
      </section>
      <section className="phase-card wod">
        <p className="eyebrow">Workout of the day</p>
        <div className="wod-title"><h2>{FORMAT_LABELS[session.wod?.format] || 'WOD'}</h2><strong>{session.wod?.duration_or_target}</strong></div>
        <MovementList movements={session.wod?.movements} />
        {session.wod?.notes && <p className="coach-note"><strong>Notes du coach</strong>{session.wod.notes}</p>}
      </section>
    </div>
  )
}
