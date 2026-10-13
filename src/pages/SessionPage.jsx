import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Leaderboard from '../components/Leaderboard.jsx'
import SessionDetailContent from '../components/SessionDetailContent.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { computeDemoLeaderboard } from '../data/demoScores.js'
import { formatDate } from '../lib/format.js'
import { apiClient } from '../services/apiClient.js'
import { useAuth } from '../state/AuthContext.jsx'
import { useSessions } from '../state/SessionsContext.jsx'

export default function SessionPage() {
  const { id } = useParams()
  const { mode } = useAuth()
  const { getSession } = useSessions()
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const [leaderboard, setLeaderboard] = useState(null)

  useEffect(() => { getSession(id).then((data) => data ? setSession(data) : setError('Cette séance est introuvable.')).catch((err) => setError(err.message)) }, [getSession, id])

  useEffect(() => {
    if (!session?.wod) return
    if (mode === 'demo') {
      setLeaderboard(computeDemoLeaderboard(session.id, session.wod.format))
      return
    }
    apiClient.leaderboard(session.id).then(setLeaderboard).catch(() => setLeaderboard(null))
  }, [session, mode])

  if (error) return <div className="page wrap"><StatePanel type="error" title="Séance indisponible" message={error} action={<Link className="button primary" to="/history">Voir l’historique</Link>} /></div>
  if (!session) return <div className="page wrap"><StatePanel title="Chargement de la séance" message="Un instant…" /></div>
  return (
    <article className="page wrap session-detail">
      <Link className="back-link" to="/history">← Retour à l’historique</Link>
      <header className="session-heading"><div><p className="eyebrow">Séance complète</p><h1>{formatDate(session.session_date)}</h1></div><span className="time-display">{session.time_slot}</span></header>
      <SessionDetailContent session={session} />
      {session.wod && (
        <section className="phase-card leaderboard-section">
          <span className="phase-number">04</span>
          <p className="eyebrow">Résultats</p>
          <h2>Leaderboard</h2>
          {leaderboard ? <Leaderboard format={leaderboard.format} rankings={leaderboard.rankings} /> : <p className="muted">Chargement…</p>}
        </section>
      )}
    </article>
  )
}
