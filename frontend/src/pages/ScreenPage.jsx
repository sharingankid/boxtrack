import { apiClient } from '../services/apiClient.js'
import useClock from '../hooks/useClock.js'
import {
  minutes,
  selectSchedule,
  slotCountdown,
  slotLabel,
} from '../lib/schedule.js'
import { movementDetail } from '../services/sessionAdapter.js'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import DemoBanner from '../components/DemoBanner.jsx'
import { ArcadeClock, PixelRunner } from '../components/TvArcade.jsx'
import { FORMAT_LABELS, formatDate, withoutDashes } from '../lib/format.js'
import { FORMAT_CUES } from '../lib/training.js'
import { useSessions } from '../state/SessionsContext.jsx'

// Fit the complete phase, including multiline instructions, to the TV column.
// Recalculate after a publication, resize or font load; no truncated movements.
function FitContent({ children }) {
  const areaRef = useRef(null)
  const contentRef = useRef(null)
  useLayoutEffect(() => {
    const area = areaRef.current
    const content = contentRef.current
    let active = true
    const fit = () => {
      if (!active) return
      const boardWidth =
        area.closest('.tv-screen')?.clientWidth || window.innerWidth
      let size = boardWidth * (area.closest('.tv-wod') ? 0.024 : 0.018)
      content.style.fontSize = `${size}px`
      for (
        let pass = 0;
        pass < 30 &&
        (content.scrollHeight > area.clientHeight ||
          content.scrollWidth > area.clientWidth);
        pass += 1
      ) {
        size *= 0.9
        content.style.fontSize = `${size}px`
      }
    }
    const observer = new ResizeObserver(fit)
    observer.observe(area)
    document.fonts.ready.then(fit)
    fit()
    return () => {
      active = false
      observer.disconnect()
    }
  }, [children])
  return (
    <div className="tv-fit-area" ref={areaRef}>
      <div className="tv-fit-content" ref={contentRef}>
        {children}
      </div>
    </div>
  )
}

function Movements({ items = [] }) {
  return (
    <ol className="tv-movements">
      {items.map((item, index) => (
        <li key={`${item.movement_name}-${index}`}>
          <b>{item.movement_name}</b>
          <small>{movementDetail(item)}</small>
        </li>
      ))}
    </ol>
  )
}

function slotProgress(session, now, current) {
  if (session.session_date !== now.date) return 0
  const start = minutes(session.start_time)
  const end = minutes(session.end_time)
  if (start === null || (current && (end === null || end <= start))) return 0
  const origin = current ? start * 60 : 0
  const target = (current ? end : start) * 60
  if (target <= origin) return 0
  return Math.max(
    0,
    Math.min(100, ((now.seconds - origin) / (target - origin)) * 100),
  )
}

function TvStandby({ now, title, message, status }) {
  return (
    <main className="tv-screen tv-standby">
      <header className="tv-header">
        <div className="tv-identity">
          <span className="tv-logo">
            LAB<span>+</span>
          </span>
          <div>
            <strong>CROSSFIT LAB</strong>
            <small>BOXTRACK / PROGRAMME DU JOUR</small>
          </div>
        </div>
        <div className="tv-date">
          <span>{formatDate(now.date)}</span>
          <ArcadeClock now={now} />
          <small>EUROPE / PARIS</small>
        </div>
      </header>
      <section
        className="tv-standby-content"
        role={status === 'error' ? 'alert' : 'status'}
      >
        <div>
          <p className="tv-standby-label">
            {status === 'error'
              ? 'CONNEXION INTERROMPUE'
              : status === 'loading'
                ? 'SYNCHRONISATION'
                : 'LE PLANNING DE LA BOX'}
          </p>
          <h2>{title}</h2>
          <p className="tv-standby-message">{message}</p>
        </div>
        <aside>
          <span>PROGRAMME DU JOUR</span>
          <div>Échauffement</div>
          <div>Technique ou force</div>
          <div>WOD du jour</div>
          <p>Affichage automatique à la réception du programme.</p>
        </aside>
      </section>
      <footer>
        <span>CROSSFIT LAB / PROGRAMMATION</span>
        <span>MISE À JOUR AUTOMATIQUE</span>
        <DemoBanner compact />
      </footer>
    </main>
  )
}

export function TvProgramme({
  session,
  current,
  following,
  now,
  error = '',
  preview = false,
}) {
  return (
    <main
      className={`tv-screen tv-programme ${preview ? 'tv-preview-board' : ''}`}
    >
      <header className="tv-header">
        <div className="tv-identity">
          <span className="tv-logo">
            LAB<span>+</span>
          </span>
          <div>
            <strong>CROSSFIT LAB</strong>
            <small>BOXTRACK / PROGRAMME DU JOUR</small>
          </div>
        </div>
        <div className="tv-session-meta">
          <span className={`tv-live-label ${current ? 'is-live' : ''}`}>
            <i />
            {preview
              ? 'Aperçu avant publication'
              : current
                ? 'En cours'
                : 'Prochaine séance'}
          </span>
          <h1 className="tv-session-title">
            {withoutDashes(session.title) || 'Entraînement du jour'}
          </h1>
          <p>{slotLabel(session)}</p>
        </div>
        <div className="tv-date">
          <span>{formatDate(preview ? session.session_date : now.date)}</span>
          {preview ? (
            <strong aria-label="Heure prévue">
              {session.start_time || '--:--'}
            </strong>
          ) : (
            <ArcadeClock now={now} />
          )}
          <small>EUROPE / PARIS</small>
        </div>
      </header>
      <section
        key={session.id}
        className="tv-content session-transition"
        aria-label="Programme de la séance"
      >
        <section className="tv-wod">
          <div className="tv-wod-heading">
            <div>
              <h2>WOD du jour</h2>
              <span className="tv-wod-format">
                {FORMAT_LABELS[session.wod?.format] || 'WOD'}
              </span>
            </div>
            {session.wod?.duration_or_target && (
              <div className="tv-objective">
                <small>OBJECTIF</small>
                <strong>{session.wod.duration_or_target}</strong>
              </div>
            )}
          </div>
          <FitContent>
            <Movements items={session.wod?.movements} />
            {session.wod?.notes && (
              <div className="tv-notes">
                <strong>LE MOT DU COACH</strong>
                <p>{withoutDashes(session.wod.notes)}</p>
              </div>
            )}
          </FitContent>
          <div className="tv-wod-bottom">
            <span>
              {FORMAT_CUES[session.wod?.format] || 'Votre entraînement du jour'}
            </span>
          </div>
        </section>
        <aside
          className={`tv-side ${session.skill_strength ? '' : 'no-strength'}`}
          aria-label="Préparation de la séance"
        >
          <section className="tv-phase tv-warmup">
            <div className="tv-phase-heading">
              <h2>Échauffement</h2>
            </div>
            <FitContent>
              <h3>Général</h3>
              <p>{withoutDashes(session.warmup?.general) || 'Non renseigné'}</p>
              <h3>Spécifique</h3>
              <p>
                {withoutDashes(session.warmup?.specific) || 'Non renseigné'}
              </p>
            </FitContent>
          </section>
          {session.skill_strength && (
            <section className="tv-phase tv-strength">
              <div className="tv-phase-heading">
                <h2>
                  {session.skill_strength?.kind === 'strength'
                    ? 'Force'
                    : 'Technique'}
                </h2>
              </div>
              <FitContent>
                <Movements items={session.skill_strength?.movements} />
                <p className="tv-strength-instructions">
                  {withoutDashes(session.skill_strength.instructions)}
                </p>
              </FitContent>
            </section>
          )}
        </aside>
      </section>
      <footer>
        <div className="tv-timeline">
          <div className="tv-timeline-labels">
            <strong>
              {preview
                ? 'APERÇU · NON PUBLIÉ'
                : current
                  ? 'SÉANCE EN COURS'
                  : 'PROCHAIN CRÉNEAU'}
            </strong>
            <span>
              {slotLabel(session)}
              {!preview && slotCountdown(session, now, current) && (
                <b> · {slotCountdown(session, now, current)}</b>
              )}
            </span>
          </div>
          <div
            className="tv-timeline-track"
            role="progressbar"
            aria-label="Progression du créneau"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(slotProgress(session, now, current))}
          >
            <span
              className="tv-timeline-fill"
              style={{ width: `${slotProgress(session, now, current)}%` }}
            />
            <span
              className="tv-timeline-runner"
              style={{ left: `${slotProgress(session, now, current)}%` }}
            >
              <PixelRunner />
            </span>
            <span className="tv-timeline-finish" aria-hidden="true" />
          </div>
        </div>
        <span className="tv-next-slot">
          {preview
            ? 'CONTRÔLEZ LA LISIBILITÉ AVANT D’ENREGISTRER'
            : error
              ? 'Hors connexion · dernières données reçues'
              : following && String(following.id) !== String(session.id)
                ? `À SUIVRE · ${slotLabel(following)}`
                : 'PRÊTS POUR LE PROCHAIN EFFORT'}
        </span>
        {!preview && <DemoBanner compact />}
      </footer>
    </main>
  )
}

export default function ScreenPage() {
  const {
    sessions,
    status: listStatus,
    error: listError,
    refresh,
    mode,
  } = useSessions()
  const [tv, setTv] = useState({ data: null, error: '', loaded: false })
  const now = useClock()
  useEffect(() => {
    if (mode === 'api') return
    const timer = setInterval(() => refresh({ silent: true }), 30000)
    return () => clearInterval(timer)
  }, [refresh, mode])
  useEffect(() => {
    if (mode !== 'api') return
    let active = true
    let pending = false
    const update = async () => {
      if (pending) return
      pending = true
      try {
        const data = await apiClient.tvNow()
        if (active) setTv({ data, error: '', loaded: true })
      } catch {
        if (active)
          setTv((previous) => ({
            ...previous,
            loaded: true,
            error: 'Connexion indisponible.',
          }))
      } finally {
        pending = false
      }
    }
    update()
    const timer = setInterval(update, 30000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [mode, now.date, now.time])
  const schedule = selectSchedule(sessions, now)
  const session =
    mode === 'api' ? tv.data?.current || tv.data?.next : schedule.display
  const current = mode === 'api' ? tv.data?.current : schedule.current
  const following = mode === 'api' ? tv.data?.next : schedule.next
  const incomplete = mode === 'api' ? false : schedule.incomplete
  const error = mode === 'api' ? tv.error : listError
  const status =
    mode === 'api'
      ? !tv.loaded
        ? 'loading'
        : tv.error
          ? 'error'
          : 'ready'
      : listStatus
  if (status === 'loading')
    return (
      <TvStandby
        now={now}
        status="loading"
        title="Chargement du programme"
        message="Connexion au planning de la salle…"
      />
    )
  if (status === 'error' && (mode === 'api' ? !tv.data : !sessions.length))
    return (
      <TvStandby
        now={now}
        status="error"
        title="Programme indisponible"
        message="Connexion indisponible. Nouvelle tentative automatique dans 30 secondes."
      />
    )
  if (!session)
    return (
      <TvStandby
        now={now}
        status={error ? 'error' : 'empty'}
        title={incomplete ? 'Horaires à confirmer' : 'Aucune séance à venir'}
        message={
          incomplete
            ? 'Le coach doit compléter les horaires du programme.'
            : error
              ? 'Connexion indisponible. Nouvelle tentative automatique dans 30 secondes.'
              : 'Le programme s’affichera ici dès la prochaine séance prévue aujourd’hui.'
        }
      />
    )
  return (
    <TvProgramme
      session={session}
      current={current}
      following={following}
      now={now}
      error={error}
    />
  )
}
