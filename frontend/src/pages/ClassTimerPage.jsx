import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { loadToday } from '../services/publicSessions.js'
import { useAuth } from '../state/AuthContext.jsx'
import useClock from '../hooks/useClock.js'
import Icon from '../components/Icon.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import PixelAthlete from '../components/PixelAthlete.jsx'
import { ATHLETES } from '../data/athletes.js'
import { athleteIndexFor } from '../lib/movementAnimation.js'
import { selectSchedule, slotLabel } from '../lib/schedule.js'
import { FORMAT_LABELS, withoutDashes } from '../lib/format.js'
import {
  addFinisher,
  formatElapsed,
  rankFinishers,
} from '../lib/classTimer.js'

const blankTimer = { startedAt: null, finishers: [] }
function readTimer(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return value && Array.isArray(value.finishers) ? value : blankTimer
  } catch {
    return blankTimer
  }
}

// One shared device (tablet or phone at the box) times the whole class.
export default function ClassTimerPage() {
  const { mode } = useAuth()
  const now = useClock()
  const [params] = useSearchParams()
  const [sessions, setSessions] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [resetting, setResetting] = useState(false)
  const [cheerId, setCheerId] = useState(null)
  const [, setTick] = useState(0)
  const nameRef = useRef(null)

  useEffect(() => {
    let active = true
    loadToday(mode, now.date)
      .then((items) => active && setSessions(items))
      .catch(() => active && setSessions([]))
    return () => {
      active = false
    }
    // Load once per visit, like the home page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wait for the session before starting, so the ranking is stored under it.
  const loaded = sessions !== null
  const session =
    sessions?.find((s) => String(s.id) === params.get('seance')) ||
    selectSchedule(sessions || [], now).display
  const storageKey = `boxtrack.classTimer.${session?.id ?? 'libre'}.${now.date}`
  const [timer, setTimer] = useState(() => readTimer(storageKey))
  useEffect(() => setTimer(readTimer(storageKey)), [storageKey])

  const save = (next) => {
    setTimer(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      /* Private mode: the ranking lasts for this visit only. */
    }
  }
  const running = timer.startedAt !== null
  // "Start" stores a start time 3 s ahead: a negative elapsed time is the countdown.
  const elapsed = running ? Date.now() - timer.startedAt : 0
  const countdown = running && elapsed < 0 ? Math.ceil(-elapsed / 1000) : null
  const racing = running && elapsed >= 0
  const go = racing && elapsed < 900

  useEffect(() => {
    if (!cheerId) return
    const timeout = setTimeout(() => setCheerId(null), 2500)
    return () => clearTimeout(timeout)
  }, [cheerId])

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => setTick((value) => value + 1), 100)
    let lock = null
    navigator.wakeLock
      ?.request('screen')
      .then((value) => (lock = value))
      .catch(() => {})
    return () => {
      clearInterval(interval)
      lock?.release().catch(() => {})
    }
  }, [running])

  const finish = (event) => {
    event.preventDefault()
    const result = addFinisher(timer.finishers, name, elapsed)
    setError(result.error || '')
    if (result.error) return
    save({ ...timer, finishers: result.finishers })
    setCheerId(result.finishers.at(-1).id)
    setName('')
    nameRef.current?.focus()
  }
  const ranking = rankFinishers(timer.finishers)

  return (
    <div className="home-page class-timer-page">
      <header className="home-header">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Icon name="barbell" />
          </span>
          <span>
            <strong>
              BOXTRACK<span className="brand-dot">.</span>
            </strong>
            <small>CROSSFIT LAB</small>
          </span>
        </Link>
        <Link to="/" className="button home-coach-link">
          Séance du jour
        </Link>
      </header>

      <main className="home-main class-timer-main">
        <section className="class-timer-hero">
          <p className="eyebrow">CHRONO DE LA CLASSE</p>
          <h1>
            {session
              ? withoutDashes(session.title) || 'Entraînement'
              : 'Chrono libre'}
          </h1>
          {session && (
            <p className="muted">
              {slotLabel(session)} · {FORMAT_LABELS[session.wod?.format] || 'WOD'}
              {session.wod?.duration_or_target
                ? ` · ${session.wod.duration_or_target}`
                : ''}
            </p>
          )}
          <p
            className={`class-timer-clock ${racing ? 'is-running' : ''}`}
            role="timer"
            aria-label="Temps écoulé"
          >
            {formatElapsed(elapsed)}
          </p>
          <div
            className={`class-track ${racing ? 'is-racing' : ''}`}
            aria-hidden="true"
          >
            {ATHLETES.map((athlete, index) => (
              <PixelAthlete
                key={athlete.id}
                athlete={athlete}
                move={racing ? 'run' : 'idle'}
                phase={index}
              />
            ))}
          </div>
          {running ? (
            <button
              className="button ghost"
              onClick={() => setResetting(true)}
            >
              Réinitialiser
            </button>
          ) : (
            <button
              className="button primary class-timer-start"
              disabled={!loaded}
              onClick={() => save({ startedAt: Date.now() + 3000, finishers: [] })}
            >
              <Icon name="bolt" />
              Démarrer le chrono
            </button>
          )}
        </section>

        <section className="class-timer-finish" aria-label="Arrivées">
          <form onSubmit={finish} className="class-timer-form">
            <label htmlFor="finisher-name">Qui vient de finir ?</label>
            <div>
              <input
                id="finisher-name"
                ref={nameRef}
                value={name}
                maxLength={40}
                autoComplete="off"
                placeholder="Prénom"
                disabled={!racing}
                onChange={(event) => setName(event.target.value)}
              />
              <button className="button primary" disabled={!racing}>
                <Icon name="check" />A fini
              </button>
            </div>
            {!running && (
              <p className="muted">Démarrez le chrono au top départ.</p>
            )}
            {countdown && <p className="muted">Prêts…</p>}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </form>

          <h2>Classement</h2>
          {ranking.length ? (
            <ol className="class-ranking" aria-live="polite">
              {ranking.map((item) => (
                <li
                  key={item.id}
                  className={`is-rank-${item.rank} ${item.id === cheerId ? 'is-new' : ''}`}
                >
                  <span className="class-rank">{item.rank}</span>
                  <PixelAthlete
                    className="class-rank-athlete"
                    athlete={ATHLETES[athleteIndexFor(item.name, ATHLETES.length)]}
                    move={item.id === cheerId ? 'celebrate' : 'idle'}
                  />
                  <b>{item.name}</b>
                  <span className="class-time">
                    {formatElapsed(item.time)}
                    {item.gap > 0 && <small>+{formatElapsed(item.gap)}</small>}
                  </span>
                  <button
                    className="text-button"
                    aria-label={`Retirer ${item.name} du classement`}
                    onClick={() =>
                      save({
                        ...timer,
                        finishers: timer.finishers.filter(
                          (other) => other.id !== item.id,
                        ),
                      })
                    }
                  >
                    <Icon name="close" />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">Personne n’a encore fini.</p>
          )}
        </section>
      </main>

      {(countdown || go) && (
        <div className="class-countdown" aria-live="assertive">
          <span key={countdown ?? 'go'}>{countdown ?? 'GO !'}</span>
        </div>
      )}
      {resetting && (
        <ConfirmDialog
          title="Réinitialiser le chrono ?"
          confirmLabel="Réinitialiser"
          onCancel={() => setResetting(false)}
          onConfirm={() => {
            save(blankTimer)
            setResetting(false)
          }}
        >
          <p>Le temps et le classement de cette séance seront effacés.</p>
        </ConfirmDialog>
      )}
    </div>
  )
}
