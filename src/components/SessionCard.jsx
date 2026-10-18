import { Link } from 'react-router-dom'
import { FORMAT_LABELS, formatDate } from '../lib/format.js'

export default function SessionCard({ session, featured = false }) {
  return (
    <article className={`session-card ${featured ? 'featured' : ''}`}>
      <div className="card-topline">
        <span className="eyebrow">{formatDate(session.session_date)}</span>
        <span className="time-pill">{session.time_slot}</span>
      </div>
      <div className="format-row">
        <span className="format-label">{FORMAT_LABELS[session.wod?.format] || 'Séance'}</span>
        <strong>{session.wod?.duration_or_target || 'Objectif à préciser'}</strong>
      </div>
      {session.wod?.movements?.length > 0 && (
        <ol className="movement-preview">
          {session.wod.movements.slice(0, 3).map((movement, index) => (
            <li key={`${movement.movement_name}-${index}`}><span>{movement.movement_name}</span><small>{movement.detail}</small></li>
          ))}
        </ol>
      )}
      <Link className="text-link" to={`/sessions/${session.id}`}>Voir la séance <span>→</span></Link>
    </article>
  )
}
