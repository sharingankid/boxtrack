import { FORMAT_LABELS } from '../lib/format.js'

function MovementList({ movements = [] }) {
  if (!movements.length) return <p className="muted">Aucun mouvement renseigné.</p>
  return <ol className="movement-list">{movements.map((item, index) => (
    <li key={`${item.movement_name}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.movement_name}</strong><small>{item.detail}</small></li>
  ))}</ol>
}

export default function SessionDetailContent({ session }) {
  return (
    <div className="detail-grid">
      <section className="phase-card warmup">
        <span className="phase-number">01</span><p className="eyebrow">Mise en route</p><h2>Warm-Up</h2>
        <h3>Général</h3><p>{session.warmup?.general || 'Non renseigné'}</p>
        <h3>Spécifique</h3><p>{session.warmup?.specific || 'Non renseigné'}</p>
      </section>
      <section className="phase-card skill">
        <span className="phase-number">02</span><p className="eyebrow">Technique & force</p><h2>{session.skill_strength?.kind === 'strength' ? 'Strength' : 'Skill'}</h2>
        <p>{session.skill_strength?.instructions || 'Pas de bloc Skill / Strength pour cette séance.'}</p>
        <MovementList movements={session.skill_strength?.movements} />
      </section>
      <section className="phase-card wod">
        <span className="phase-number">03</span><p className="eyebrow">Workout of the day</p>
        <div className="wod-title"><h2>{FORMAT_LABELS[session.wod?.format] || 'WOD'}</h2><strong>{session.wod?.duration_or_target}</strong></div>
        <MovementList movements={session.wod?.movements} />
        {session.wod?.notes && <p className="coach-note"><strong>Conseil du coach</strong>{session.wod.notes}</p>}
      </section>
    </div>
  )
}
