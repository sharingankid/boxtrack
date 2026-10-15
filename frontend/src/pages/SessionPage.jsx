import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SessionDetailContent from '../components/SessionDetailContent.jsx'
import ShareButton from '../components/ShareButton.jsx'
import StatePanel from '../components/StatePanel.jsx'
import WodTimer from '../components/WodTimer.jsx'
import { formatDate } from '../lib/format.js'
import { useAuth } from '../state/AuthContext.jsx'
import { useSessions } from '../state/SessionsContext.jsx'

export default function SessionPage() {
  const { id } = useParams()
  const { session: auth } = useAuth()
  const { getSession } = useSessions()
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const [params, setParams] = useSearchParams()
  const timerOpen = params.get('timer') === '1'
  const navigate = useNavigate()
  const openedHere = useRef(false)
  const openTimer = () => { openedHere.current = true; setParams({ timer: '1' }) }
  const closeTimer = () => { if (openedHere.current) navigate(-1); else setParams({}, { replace: true }); openedHere.current = false }
  useEffect(() => { getSession(id).then((data) => data ? setSession(data) : setError('Cette séance est introuvable.')).catch((err) => setError(err.message)) }, [getSession, id])
  if (error) return <div className="page wrap"><StatePanel type="error" title="Séance indisponible" message={error} action={<Link className="button primary" to="/history">Voir l’historique</Link>} /></div>
  if (!session) return <div className="page wrap"><StatePanel title="Chargement de la séance" message="Un instant…" /></div>
  return (
    <article className="page wrap session-detail">
      <Link className="back-link" to="/history">← Retour à l’historique</Link>
      <header className="session-heading"><div><p className="eyebrow">Séance complète</p><h1>{formatDate(session.session_date)}</h1></div><span className="time-display">{session.time_slot}</span></header>
      <div className="session-tools">
        <button type="button" className="button primary" onClick={openTimer}>Lancer le timer</button>
        <ShareButton session={session} />
        {auth && <Link className="button ghost" to={`/admin/sessions/${id}/edit`}>Modifier la séance</Link>}
      </div>
      <SessionDetailContent session={session} />
      {timerOpen && <WodTimer session={session} onClose={closeTimer} />}
    </article>
  )
}
