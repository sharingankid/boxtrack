import StatePanel from '../components/StatePanel.jsx'
import { useAnnouncements } from '../state/AnnouncementsContext.jsx'

export default function AnnouncementsPage() {
  const { announcements, status, error, refresh } = useAnnouncements()
  const active = announcements.filter((a) => a.active !== false)

  return (
    <section className="page wrap">
      <div className="page-heading">
        <p className="eyebrow">La box en direct</p>
        <h1>Annonces<br /><em>de CrossFit LAB.</em></h1>
      </div>
      {status === 'loading' && <StatePanel title="Chargement des annonces" message="Un instant…" />}
      {status === 'error' && <StatePanel type="error" title="Annonces indisponibles" message={error} action={<button className="button primary" onClick={refresh}>Réessayer</button>} />}
      {status === 'ready' && active.length === 0 && <StatePanel type="empty" title="Aucune annonce pour le moment" message="Revenez bientôt." />}
      {active.length > 0 && (
        <div className="announcement-list">
          {active.map((announcement) => (
            <article className="announcement-card" key={announcement.id}>
              <h2>{announcement.title}</h2>
              {announcement.body && <p>{announcement.body}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
