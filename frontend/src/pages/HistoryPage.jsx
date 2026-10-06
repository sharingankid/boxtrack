import SessionCard from '../components/SessionCard.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { useSessions } from '../state/SessionsContext.jsx'

export default function HistoryPage() {
  const { sessions, status, error, refresh } = useSessions()
  const history = [...sessions].sort((a, b) => `${b.session_date}${b.time_slot}`.localeCompare(`${a.session_date}${a.time_slot}`))
  return (
    <section className="page wrap">
      <div className="page-heading"><p className="eyebrow">Archives</p><h1>L’historique<br /><em>des WODs.</em></h1><p>Revenez sur les séances précédentes et retrouvez leur contenu complet.</p></div>
      {status === 'loading' && <StatePanel title="Chargement de l’historique" message="Les séances arrivent…" />}
      {status === 'error' && <StatePanel type="error" title="Historique indisponible" message={error} action={<button className="button primary" onClick={refresh}>Réessayer</button>} />}
      {status === 'ready' && history.length === 0 && <StatePanel type="empty" title="Aucune séance archivée" message="L’historique se remplira dès la première publication." />}
      <div className="history-grid">{history.map((item) => <SessionCard key={item.id} session={item} />)}</div>
    </section>
  )
}
