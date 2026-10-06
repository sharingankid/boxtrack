import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SessionDetailContent from '../components/SessionDetailContent.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { formatDate } from '../lib/format.js'
import { useSessions } from '../state/SessionsContext.jsx'

export default function SessionPage() {
  const { id } = useParams()
  const { getSession } = useSessions()
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getSession(id).then((data) => data ? setSession(data) : setError('Cette séance est introuvable.')).catch((err) => setError(err.message)) }, [getSession, id])
  if (error) return <div className="page wrap"><StatePanel type="error" title="Séance indisponible" message={error} action={<Link className="button primary" to="/history">Voir l’historique</Link>} /></div>
  if (!session) return <div className="page wrap"><StatePanel title="Chargement de la séance" message="Un instant…" /></div>
  return (
    <article className="page wrap session-detail">
      <Link className="back-link" to="/history">← Retour à l’historique</Link>
      <header className="session-heading"><div><p className="eyebrow">Séance complète</p><h1>{formatDate(session.session_date)}</h1></div><span className="time-display">{session.time_slot}</span></header>
      <SessionDetailContent session={session} />
    </article>
  )
}
