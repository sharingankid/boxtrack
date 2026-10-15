import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSessions } from '../state/SessionsContext.jsx'
import useClock from '../hooks/useClock.js'
import { addDays, selectSchedule, sessionState, slotLabel, sortSessions, STATE_LABELS } from '../lib/schedule.js'
import { formatDate, FORMAT_LABELS } from '../lib/format.js'
import StatePanel from '../components/StatePanel.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

function SessionRow({ session, now, onDelete }) {
  const state = sessionState(session, now)
  return <article className={`planning-row ${state}`}>
    <div className="planning-time"><strong>{slotLabel(session)}</strong><span>{STATE_LABELS[state]}</span></div>
    <div className="planning-description"><h3><Link to={`/admin/sessions/${session.id}/edit`}>{session.title || FORMAT_LABELS[session.wod?.format] || 'Séance'}</Link></h3><p>{formatDate(session.session_date)}{session.wod?.duration_or_target ? ` · ${session.wod.duration_or_target}` : ''}</p></div>
    <div className="row-actions"><Link to={`/admin/sessions/${session.id}/edit`}>Modifier</Link><Link to={`/admin/sessions/${session.id}/duplicate`}>Dupliquer</Link><button onClick={() => onDelete(session)}>Supprimer</button></div>
  </article>
}
export default function DashboardPage() {
  const { sessions, status, error, refresh, deleteSession, capabilities } = useSessions()
  const now = useClock()
  const location = useLocation()
  const history = location.pathname === '/admin/history'
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')
  useEffect(() => { const timer = setInterval(() => refresh({ silent: true }), 30000); return () => clearInterval(timer) }, [refresh])
  const schedule = selectSchedule(sessions, now)
  const upcoming = sortSessions(sessions).filter(s => s.session_date > now.date && s.session_date <= addDays(now.date, 7))
  const past = sortSessions(sessions).filter(s => sessionState(s, now) === 'past').reverse()
  const remove = async () => {
    setBusy(true); setActionError('')
    try { await deleteSession(deleting.id); setDeleting(null); setNotice('Séance supprimée.') }
    catch (err) { setActionError(err.message) } finally { setBusy(false) }
  }
  const rows = items => items.map(session => <SessionRow key={session.id} session={session} now={now} onDelete={item => { setDeleting(item); setActionError('') }} />)
  return <>
    <div className="coach-title"><div><p className="eyebrow">{formatDate(now.date)}</p><h1>{history ? 'Historique' : 'Le planning'}</h1></div><Link className="button primary" to="/admin/sessions/new">Créer une séance</Link></div>
    {notice && <p role="status" className="success-message">{notice}</p>}
    {!capabilities.scheduling && <p className="notice">Les heures de fin ne sont pas encore disponibles pour ces séances. Leur état « en cours » ne peut pas être déterminé.</p>}
    {status === 'loading' && <StatePanel title="Chargement du planning" message="Un instant…" />}
    {status === 'error' && <StatePanel type="error" title="Planning indisponible" message={error} action={<button className="button primary" onClick={() => refresh()}>Réessayer</button>} />}
    {status !== 'loading' && !history && <>
      <section className="live-planning" aria-label="Séances en cours et à venir"><div><p className="eyebrow">En cours · {now.time}</p><h2>{schedule.current?.title || (schedule.current ? FORMAT_LABELS[schedule.current.wod?.format] : 'Pas de séance en cours')}</h2>{schedule.current && <Link className="text-link" to={`/admin/sessions/${schedule.current.id}/edit`}>{slotLabel(schedule.current)} · Ouvrir la séance →</Link>}</div><div><p className="eyebrow">Prochaine séance</p><h2>{schedule.next?.title || (schedule.next ? FORMAT_LABELS[schedule.next.wod?.format] : 'Aucune séance prévue')}</h2>{schedule.next && <p>{formatDate(schedule.next.session_date)} · {slotLabel(schedule.next)}</p>}</div></section>
      <section className="planning-section"><h2>Aujourd’hui <small>{schedule.today.length} séance{schedule.today.length > 1 ? 's' : ''}</small></h2>{schedule.today.length ? rows(schedule.today) : <p className="empty-inline">Aucune séance prévue aujourd’hui.</p>}</section>
      <section className="planning-section"><h2>Les 7 prochains jours</h2>{upcoming.length ? rows(upcoming) : <p className="empty-inline">Aucune autre séance prévue cette semaine.</p>}</section>
    </>}
    {status !== 'loading' && history && <section className="planning-section">{past.length ? rows(past) : <StatePanel type="empty" title="Pas encore d’historique" message="Les séances terminées apparaîtront ici." />}</section>}
    {deleting && <ConfirmDialog title="Supprimer cette séance ?" confirmLabel="Supprimer la séance" busy={busy} onCancel={() => setDeleting(null)} onConfirm={remove}><p>{formatDate(deleting.session_date)} · {slotLabel(deleting)}</p><p>Cette suppression est définitive.</p>{actionError && <p role="alert" className="form-error">{actionError}</p>}</ConfirmDialog>}
  </>
}
