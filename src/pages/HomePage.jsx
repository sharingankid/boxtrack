import { Link } from 'react-router-dom'
import SessionCard from '../components/SessionCard.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { useSessions } from '../state/SessionsContext.jsx'

const today = new Date().toISOString().slice(0, 10)

export default function HomePage() {
  const { sessions, status, error, refresh } = useSessions()
  const todaysSessions = sessions.filter((item) => item.session_date === today)

  return (
    <>
      <section className="hero wrap">
        <div>
          <p className="eyebrow">Le programme du jour</p>
          <h1>Ensemble,<br /><em>plus loin.</em></h1>
          <p className="hero-copy">Retrouvez les séances de CrossFit LAB, choisissez votre créneau et arrivez prêt à donner le meilleur.</p>
          <div className="hero-actions"><a className="button primary" href="#sessions">Voir le WOD</a><Link className="button ghost" to="/screen">Mode TV</Link></div>
        </div>
        <div className="hero-visual" aria-hidden="true"><span className="outline-word">UNBROKEN</span><div className="hero-number">01</div><div className="pulse-line" /></div>
      </section>

      <section className="section wrap" id="sessions">
        <div className="section-heading"><div><p className="eyebrow">Aujourd’hui</p><h2>Choisissez votre créneau</h2></div><span className="session-count">{todaysSessions.length} séance{todaysSessions.length > 1 ? 's' : ''}</span></div>
        {status === 'loading' && <StatePanel title="Chargement des séances" message="On prépare le tableau du jour…" />}
        {status === 'error' && <StatePanel type="error" title="Impossible de charger les séances" message={error} action={<button className="button primary" onClick={refresh}>Réessayer</button>} />}
        {status === 'ready' && !todaysSessions.length && <StatePanel type="empty" title="Pas encore de séance publiée" message="Revenez bientôt : le prochain WOD apparaîtra ici." />}
        {status === 'ready' && todaysSessions.length > 0 && <div className="session-grid">{todaysSessions.map((item, index) => <SessionCard key={item.id} session={item} featured={index === 0} />)}</div>}
      </section>

      <section className="community-strip"><div className="wrap"><p className="eyebrow">La box en mouvement</p><h2>Chaque séance compte.<br />Chaque athlète aussi.</h2><Link className="text-link light" to="/history">Explorer les séances précédentes <span>→</span></Link></div></section>
    </>
  )
}
