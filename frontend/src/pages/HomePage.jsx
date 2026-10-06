import { Link } from 'react-router-dom'
import SessionCard from '../components/SessionCard.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { FORMAT_LABELS, formatDate, toLocalISODate } from '../lib/format.js'
import { useSessions } from '../state/SessionsContext.jsx'

export default function HomePage() {
  const { sessions, status, error, refresh } = useSessions()
  const today = toLocalISODate()
  const todaysSessions = sessions
    .filter((item) => item.session_date === today)
    .sort((a, b) => a.time_slot.localeCompare(b.time_slot))
  const featuredSession = todaysSessions[0]

  return (
    <>
      <section className="hero wrap" aria-labelledby="home-title">
        <div className="hero-copy-block">
          <p className="eyebrow"><span className="live-dot" />Le programme du jour</p>
          <h1 id="home-title">Ensemble,<br /><em>plus loin.</em></h1>
          <p className="hero-copy">Retrouvez les séances de CrossFit LAB, choisissez votre créneau et arrivez prêt à donner le meilleur.</p>
          <div className="hero-actions"><a className="button primary" href="#sessions">Voir le WOD</a><Link className="button ghost" to="/screen">Mode TV</Link></div>
          <div className="hero-trust" aria-label="Caractéristiques de BoxTrack"><span><b>01</b> WOD structuré</span><span><b>02</b> Mise à jour coach</span><span><b>03</b> Lisible partout</span></div>
        </div>
        <div className="hero-board">
          <div className="board-topline"><span>WOD // TODAY</span><span>{featuredSession ? formatDate(featuredSession.session_date, { weekday: 'short' }) : 'CrossFit LAB'}</span></div>
          {featuredSession ? <>
            <div className="board-main"><div><span className="board-kicker">Format</span><strong>{FORMAT_LABELS[featuredSession.wod?.format] || 'WOD'}</strong><small>{featuredSession.wod?.duration_or_target}</small></div><span className="board-time">{featuredSession.time_slot}</span></div>
            <ol className="board-movements">{featuredSession.wod?.movements?.slice(0, 3).map((movement, index) => <li key={`${movement.movement_name}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><b>{movement.movement_name}</b><small>{movement.detail}</small></li>)}</ol>
            <Link className="board-link" to={`/sessions/${featuredSession.id}`}>Ouvrir la séance <span>↗</span></Link>
          </> : <div className="board-empty"><strong>READY</strong><span>Le prochain WOD s’affichera ici.</span></div>}
          <span className="board-watermark" aria-hidden="true">LAB</span>
        </div>
      </section>

      <section className="section wrap" id="sessions">
        <div className="section-heading"><div><p className="eyebrow">Aujourd’hui</p><h2>Choisissez votre créneau</h2></div><span className="session-count">{todaysSessions.length} séance{todaysSessions.length > 1 ? 's' : ''}</span></div>
        {status === 'loading' && <StatePanel title="Chargement des séances" message="On prépare le tableau du jour…" />}
        {status === 'error' && <StatePanel type="error" title="Impossible de charger les séances" message={error} action={<button className="button primary" onClick={refresh}>Réessayer</button>} />}
        {status === 'ready' && !todaysSessions.length && <StatePanel type="empty" title="Pas encore de séance publiée" message="Revenez bientôt : le prochain WOD apparaîtra ici." />}
        {status === 'ready' && todaysSessions.length > 0 && <div className="session-grid">{todaysSessions.map((item, index) => <SessionCard key={item.id} session={item} featured={index === 0} />)}</div>}
      </section>

      <section className="community-strip"><div className="wrap community-content"><div><p className="eyebrow">La box en mouvement</p><h2>Chaque séance compte.<br />Chaque athlète aussi.</h2></div><div className="community-action"><p>Retrouvez les entraînements passés, les formats et les mouvements travaillés à la box.</p><Link className="button community-button" to="/history">Explorer l’historique <span>→</span></Link></div></div></section>
    </>
  )
}
