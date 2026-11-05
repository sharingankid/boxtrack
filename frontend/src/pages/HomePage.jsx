import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { movementDetail } from '../services/sessionAdapter.js'
import { loadToday, loadUpcoming } from '../services/publicSessions.js'
import { useAuth } from '../state/AuthContext.jsx'
import useClock from '../hooks/useClock.js'
import Icon from '../components/Icon.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import ExerciseChecklist from '../components/ExerciseChecklist.jsx'
import PixelAthlete from '../components/PixelAthlete.jsx'
import { ATHLETES } from '../data/athletes.js'
import { movementAnimation } from '../lib/movementAnimation.js'
import { isFrontMove } from '../lib/athletePoses.js'
import {
  selectSchedule,
  sessionState,
  slotCountdown,
  slotLabel,
  sortSessions,
} from '../lib/schedule.js'
import { FORMAT_LABELS, formatDate, shortDate, withoutDashes } from '../lib/format.js'
import { FORMAT_CUES } from '../lib/training.js'

const UPCOMING_KEY = 'boxtrack.home.showUpcoming'
function readShowUpcoming() {
  try {
    return localStorage.getItem(UPCOMING_KEY) === '1'
  } catch {
    return false
  }
}

function SessionCard({ session, current, checklist = false }) {
  const movements = (session.wod?.movements || []).filter((item) =>
    item.movement_name?.trim(),
  )
  return (
    <article className={`home-session-card ${current ? 'is-current' : ''}`}>
      <header>
        <span className={`home-live-label ${current ? 'is-live' : ''}`}>
          <i />
          {current ? 'En cours' : 'À venir'}
        </span>
        <h3>{withoutDashes(session.title) || 'Entraînement'}</h3>
        <p>
          {shortDate(session.session_date)} · {slotLabel(session)}
        </p>
      </header>
      <div className="home-session-wod">
        <div className="home-session-wod-heading">
          <strong>WOD</strong>
          <span>{FORMAT_LABELS[session.wod?.format] || '—'}</span>
        </div>
        {session.wod?.duration_or_target && (
          <p className="home-session-objective">{session.wod.duration_or_target}</p>
        )}
        {movements.length > 0 && checklist && (
          <ExerciseChecklist session={session} movements={movements} />
        )}
        {movements.length > 0 && !checklist && (
          <ul>
            {movements.slice(0, 4).map((item, index) => (
              <li key={`${item.movement_name}-${index}`}>
                <b>{item.movement_name}</b>
                <small>{movementDetail(item)}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
      {FORMAT_CUES[session.wod?.format] && (
        <p className="home-session-cue">{FORMAT_CUES[session.wod.format]}</p>
      )}
    </article>
  )
}

export default function HomePage() {
  const now = useClock()
  const { mode } = useAuth()
  const [today, setToday] = useState({ sessions: [], status: 'loading', error: '' })
  const [upcoming, setUpcoming] = useState({ sessions: [], status: 'loading', error: '' })
  const [showUpcoming, setShowUpcoming] = useState(readShowUpcoming)
  const toggleUpcoming = () => {
    setShowUpcoming(!showUpcoming)
    try {
      localStorage.setItem(UPCOMING_KEY, showUpcoming ? '0' : '1')
    } catch {
      /* Private mode: the choice lasts for this visit only. */
    }
  }

  useEffect(() => {
    let active = true
    loadToday(mode, now.date)
      .then((sessions) => {
        if (active) setToday({ sessions, status: 'ready', error: '' })
      })
      .catch(() => {
        if (active)
          setToday({
            sessions: [],
            status: 'error',
            error: 'Connexion indisponible. Réessayez dans un instant.',
          })
      })
    loadUpcoming(mode, now.date)
      .then((sessions) => {
        if (active)
          setUpcoming({ sessions: sortSessions(sessions), status: 'ready', error: '' })
      })
      .catch(() => {
        if (active)
          setUpcoming({
            sessions: [],
            status: 'error',
            error: 'Connexion indisponible. Réessayez dans un instant.',
          })
      })
    return () => {
      active = false
    }
    // Only needs to run once per visit - the clock's seconds tick shouldn't refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const schedule = selectSchedule(today.sessions, now)
  const laterToday = upcoming.sessions.filter(
    (session) =>
      sessionState(session, now) === 'upcoming' &&
      session.session_date === now.date &&
      String(session.id) !== String(schedule.display?.id),
  )
  const futureDays = upcoming.sessions.filter(
    (session) => session.session_date > now.date,
  )
  // The four mock-ups warm up the page, seen from the front: today's front
  // movements first, then a squat / jumping jack / jump / run warm-up.
  const todayMoves = (schedule.display?.wod?.movements || [])
    .map((item) => item.movement_name?.trim())
    .filter(Boolean)
    .map(movementAnimation)
    .filter(isFrontMove)
  const lineup = [
    ...new Set([...todayMoves, 'squat', 'jack', 'jump', 'run']),
  ].slice(0, ATHLETES.length)

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="barbell" />
          </span>
          <span>
            <strong>
              BOXTRACK<span className="brand-dot">.</span>
            </strong>
            <small>CROSSFIT LAB</small>
          </span>
        </div>
        <div className="home-header-links">
          <Link to="/seance" className="button primary home-coach-link">
            <Icon name="user" />
            Mon espace
          </Link>
          <Link to="/login" className="button home-coach-link">
            Coach
            <Icon name="arrow" />
          </Link>
        </div>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <p className="eyebrow">{formatDate(now.date)}</p>
          <h1>
            LA SÉANCE
            <br />
            <span>D’AUJOURD’HUI.</span>
          </h1>
          <p className="home-hero-sub">
            Consultez le programme du jour et les prochaines séances de la box,
            sans vous connecter.
          </p>
          <div className="home-lineup" aria-hidden="true">
            {ATHLETES.map((athlete, index) => (
              <PixelAthlete
                key={athlete.id}
                athlete={athlete}
                move={lineup[index]}
                phase={index}
              />
            ))}
          </div>
        </section>

        <section className="home-section" aria-label="Séance en cours ou à venir aujourd'hui">
          <div className="home-section-heading">
            <h2>Aujourd’hui</h2>
          </div>
          {today.status === 'loading' && <p className="muted">Chargement du programme…</p>}
          {today.status === 'error' && <p className="form-error">{today.error}</p>}
          {today.status === 'ready' && !schedule.display && (
            <p className="muted">Aucune séance programmée pour le moment aujourd’hui.</p>
          )}
          {schedule.display && (
            <>
              <SessionCard
                key={schedule.display.id}
                session={schedule.display}
                current={!!schedule.current}
                checklist
              />
              {slotCountdown(schedule.display, now, !!schedule.current) && (
                <p className="home-countdown">
                  {slotCountdown(schedule.display, now, !!schedule.current)}
                </p>
              )}
              <Link
                className="button home-timer-link"
                to={`/chrono?seance=${schedule.display.id}`}
              >
                <Icon name="clock" />
                Chrono et classement de la classe
                <Icon name="arrow" />
              </Link>
            </>
          )}
          {laterToday.length > 0 && (
            <div className="home-later-today">
              <span>Plus tard aujourd’hui</span>
              <ul>
                {laterToday.map((session) => (
                  <li key={session.id}>
                    {slotLabel(session)} · {withoutDashes(session.title) || 'Entraînement'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="home-section" aria-label="Prochaines séances">
          <div className="home-section-heading">
            <h2>Prochaines séances</h2>
            <button
              className="button ghost home-upcoming-toggle"
              aria-expanded={showUpcoming}
              aria-controls="home-upcoming"
              onClick={toggleUpcoming}
            >
              {showUpcoming
                ? 'Masquer'
                : `Afficher${futureDays.length ? ` (${Math.min(futureDays.length, 6)})` : ''}`}
            </button>
          </div>
          <div id="home-upcoming" hidden={!showUpcoming}>
            {upcoming.status === 'loading' && <p className="muted">Chargement…</p>}
            {upcoming.status === 'error' && <p className="form-error">{upcoming.error}</p>}
            {upcoming.status === 'ready' && futureDays.length === 0 && (
              <p className="muted">Aucune séance à venir n’est encore programmée.</p>
            )}
            {futureDays.length > 0 && (
              <div className="home-upcoming-grid">
                {futureDays.slice(0, 6).map((session) => (
                  <SessionCard key={session.id} session={session} current={false} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <span>BOXTRACK <span>/</span> CROSSFIT LAB</span>
        <DemoBanner compact />
      </footer>
    </div>
  )
}
