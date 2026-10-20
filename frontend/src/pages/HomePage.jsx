import { Link } from 'react-router-dom'
import SessionCard from '../components/SessionCard.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { formatDate, toLocalISODate } from '../lib/format.js'
import { useSessions } from '../state/SessionsContext.jsx'

export default function HomePage() {
  const { sessions, status, error, refresh } = useSessions()
  const today = toLocalISODate()
  const todaysSessions = sessions.filter((item) => item.session_date === today)
    .sort((a, b) => a.time_slot.localeCompare(b.time_slot))

  return (
    <section className="page wrap" aria-labelledby="home-title">
      <div className="page-heading home-heading">
        <div><p className="eyebrow">CrossFit LAB · Toulouse</p><h1 id="home-title">Le programme du jour</h1><p>{formatDate(today)}</p></div>
        <Link className="button ghost" to="/screen">Vue TV</Link>
      </div>
      {status === 'loading' && <StatePanel title="Chargement des séances" message="Un instant…" />}
      {status === 'error' && <StatePanel type="error" title="Séances indisponibles" message={error} action={<button className="button primary" onClick={() => refresh()}>Réessayer</button>} />}
      {status === 'ready' && !todaysSessions.length && <StatePanel type="empty" title="Aucune séance aujourd’hui" message="Le coach n’a pas encore publié de séance." />}
      {status === 'ready' && todaysSessions.length > 0 && <div className="session-grid">{todaysSessions.map((item) => <SessionCard key={item.id} session={item} />)}</div>}
      <div className="history-link"><p>Retrouvez les séances précédentes.</p><Link className="text-link" to="/history">Voir l’historique →</Link></div>
    </section>
  )
}
