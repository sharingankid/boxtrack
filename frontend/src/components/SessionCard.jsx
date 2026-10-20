import { Link } from 'react-router-dom'
import { FORMAT_LABELS, formatDate } from '../lib/format.js'

export default function SessionCard({ session, featured = false }) {
  const movements = session.wod?.movements || []
  return (
    <article className={`session-card ${featured ? 'featured' : ''}`}>
      <div className="card-topline">
        <span className="eyebrow">{featured && <i>À venir</i>}{formatDate(session.session_date)}</span>
        <span className="time-pill">{session.time_slot}</span>
      </div>
      <div className="format-row">
        <span className="format-label">{FORMAT_LABELS[session.wod?.format] || 'Séance'}</span>
        <strong>{session.wod?.duration_or_target || 'Objectif à préciser'}</strong>
      </div>
      {movements.length > 0 && (
        <ol className="movement-preview">
          {movements.slice(0, 3).map((movement, index) => (
            <li key={`${movement.movement_name}-${index}`}><span><b>{String(index + 1).padStart(2, '0')}</b>{movement.movement_name}</span><small>{movement.detail}</small></li>
          ))}
        </ol>
      )}
      <div className="card-footer"><span>{movements.length} mouvement{movements.length > 1 ? 's' : ''}</span><Link className="text-link" to={`/sessions/${session.id}`} aria-label={`Voir la séance de ${session.time_slot}`}>Voir la séance <span>→</span></Link></div>
    </article>
  )
}
