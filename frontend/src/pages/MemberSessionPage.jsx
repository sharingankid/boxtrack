import { useEffect, useState } from 'react'
import { useMember } from '../state/MemberContext.jsx'
import useClock from '../hooks/useClock.js'
import { loadToday } from '../services/publicSessions.js'
import { selectSchedule, slotCountdown, slotLabel } from '../lib/schedule.js'
import { FORMAT_LABELS, formatDate, withoutDashes } from '../lib/format.js'
import { ATHLETES } from '../data/athletes.js'
import SessionPhases from '../components/SessionPhases.jsx'
import ExerciseChecklist from '../components/ExerciseChecklist.jsx'
import ScoreCard from '../components/ScoreCard.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import StatePanel from '../components/StatePanel.jsx'
import PixelAthlete from '../components/PixelAthlete.jsx'

// Hero of a session: live / upcoming badge, title, slot, format.
export function SessionHero({ session, current, countdown }) {
  return (
    <section className="session-hero">
      <span className={`home-live-label ${current ? 'is-live' : ''}`}>
        <i />
        {current ? 'En cours' : countdown ? 'À venir' : formatDate(session.session_date)}
      </span>
      <h1>{withoutDashes(session.title) || 'Entraînement du jour'}</h1>
      <p>
        {formatDate(session.session_date)} · {slotLabel(session)}
        {session.wod?.format && <b> · {FORMAT_LABELS[session.wod.format]}</b>}
      </p>
      {countdown && <p className="session-countdown">{countdown}</p>}
    </section>
  )
}

// Today's session (QR code on the TV): open to guests and members.
export default function MemberSessionPage() {
  const { mode, member } = useMember()
  const now = useClock()
  const [today, setToday] = useState({ status: 'loading', sessions: [] })
  const [fresh, setFresh] = useState(null)
  const load = () => {
    setToday((current) => ({ ...current, status: 'loading' }))
    loadToday(mode, now.date)
      .then((sessions) => setToday({ status: 'ready', sessions }))
      .catch(() => setToday({ status: 'error', sessions: [] }))
  }
  useEffect(() => {
    load()
    // Loaded once per visit; the clock's tick shouldn't refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (today.status === 'loading')
    return <StatePanel title="Chargement de la séance" message="Un instant…" />
  if (today.status === 'error')
    return (
      <StatePanel
        type="error"
        title="Séance indisponible"
        message="Connexion indisponible. Vérifie le réseau puis réessaie."
        action={
          <button className="button primary" onClick={load}>
            Réessayer
          </button>
        }
      />
    )
  const schedule = selectSchedule(today.sessions, now)
  const session = schedule.display
  if (!session)
    return (
      <section className="member-empty">
        <div className="gate-track" aria-hidden="true">
          {ATHLETES.map((athlete, index) => (
            <PixelAthlete key={athlete.id} athlete={athlete} move="idle" phase={index} />
          ))}
        </div>
        <h2>Pas de séance aujourd’hui</h2>
        <p className="muted">Repos bien mérité. Le programme arrive ici dès que le coach le publie.</p>
      </section>
    )
  const movements = (session.wod?.movements || []).filter((item) => item.movement_name?.trim())
  return (
    <div className="member-page">
      <SessionHero
        session={session}
        current={!!schedule.current}
        countdown={slotCountdown(session, now, !!schedule.current)}
      />
      <SessionPhases session={session} />
      {movements.length > 0 && (
        <section className="member-card">
          <h2>Coche tes exercices</h2>
          <ExerciseChecklist
            key={session.id}
            session={session}
            movements={movements}
            avatarId={member?.avatar}
          />
        </section>
      )}
      <ScoreCard key={`score-${session.id}`} session={session} onSaved={setFresh} />
      {session.wod && <Leaderboard wodId={session.id} board={fresh} />}
    </div>
  )
}
