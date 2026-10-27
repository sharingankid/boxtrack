import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSessions } from '../state/SessionsContext.jsx'
import useClock from '../hooks/useClock.js'
import {
  addDays,
  minutes,
  selectSchedule,
  sessionState,
  slotLabel,
  sortSessions,
  STATE_LABELS,
} from '../lib/schedule.js'
import { formatDate, FORMAT_LABELS } from '../lib/format.js'
import StatePanel from '../components/StatePanel.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Icon from '../components/Icon.jsx'
import LiveTvEmbed from '../components/LiveTvEmbed.jsx'

const phaseText = (value, fallback) =>
  value
    ?.split('\n')
    .map((part) => part.trim())
    .find(Boolean) || fallback

function SessionRow({ session, now, onDelete }) {
  const state = sessionState(session, now)
  return (
    <article className={`planning-row ${state}`}>
      <div className="planning-time">
        <strong>{session.start_time}</strong>
        <span>{session.end_time}</span>
        <small>{STATE_LABELS[state]}</small>
      </div>
      <div className="planning-description">
        <p className="session-format">
          {FORMAT_LABELS[session.wod?.format] || 'Séance'}
          {session.wod?.duration_or_target
            ? ` / ${session.wod.duration_or_target}`
            : ''}
        </p>
        <h3>
          <Link to={`/coach/sessions/${session.id}/edit`}>
            {session.title || 'Entraînement du jour'}
          </Link>
        </h3>
        <p>{formatDate(session.session_date)}</p>
      </div>
      <div className="row-actions">
        <Link to={`/coach/sessions/${session.id}/edit`}>
          <Icon name="edit" />
          Modifier
        </Link>
        <Link to={`/coach/sessions/new?duplicate=${session.id}`}>
          <Icon name="copy" />
          Dupliquer
        </Link>
        <button onClick={() => onDelete(session)}>
          <Icon name="trash" />
          Supprimer
        </button>
      </div>
    </article>
  )
}
export default function DashboardPage() {
  const { sessions, status, error, refresh, deleteSession } = useSessions()
  const now = useClock()
  const location = useLocation()
  const history = location.pathname === '/coach/sessions'
  const upcomingView = location.pathname === '/coach/upcoming'
  const [selectedDate, setSelectedDate] = useState(null)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')
  useEffect(() => {
    const timer = setInterval(() => refresh({ silent: true }), 30000)
    return () => clearInterval(timer)
  }, [refresh])
  const schedule = selectSchedule(sessions, now)
  const date =
    selectedDate && selectedDate >= now.date ? selectedDate : now.date
  const daySessions = sortSessions(sessions).filter(
    (s) => s.session_date === date,
  )
  const upcoming = sortSessions(sessions).filter(
    (s) => s.session_date > now.date,
  )
  const upcomingDays = Object.entries(
    upcoming.reduce((days, session) => {
      ;(days[session.session_date] ||= []).push(session)
      return days
    }, {}),
  )
  const past = sortSessions(sessions)
    .filter((s) => sessionState(s, now) === 'past')
    .reverse()
    .filter((s) =>
      `${s.title || ''} ${s.wod?.format || ''} ${s.session_date} ${formatDate(s.session_date)}`
        .toLocaleLowerCase('fr')
        .includes(search.toLocaleLowerCase('fr')),
    )
  const featured = schedule.current || schedule.next
  const following = schedule.current
    ? schedule.next
    : sortSessions(sessions).find(
        (s) =>
          sessionState(s, now) === 'upcoming' &&
          String(s.id) !== String(featured?.id),
      )
  const start = minutes(schedule.current?.start_time),
    end = minutes(schedule.current?.end_time)
  const elapsed =
    start !== null && end > start
      ? Math.min(
          100,
          Math.max(
            0,
            ((Math.floor(now.seconds / 60) - start) / (end - start)) * 100,
          ),
        )
      : 0
  const remove = async () => {
    setBusy(true)
    setActionError('')
    try {
      await deleteSession(deleting.id)
      setDeleting(null)
      setNotice('Séance supprimée.')
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }
  const rows = (items) =>
    items.map((session) => (
      <SessionRow
        key={session.id}
        session={session}
        now={now}
        onDelete={(item) => {
          setDeleting(item)
          setActionError('')
        }}
      />
    ))
  const upcomingSection = (
    <section className="planning-section upcoming-planning">
      {!upcomingView && (
        <div className="section-heading">
          <h2>Prochaines séances</h2>
          <Icon name="calendar" />
        </div>
      )}
      {upcoming.length ? (
        upcomingDays.map(([day, items]) => (
          <section
            className="upcoming-day"
            key={day}
            aria-labelledby={`upcoming-${day}`}
          >
            <div className="upcoming-day-heading">
              <span className="upcoming-date-badge" aria-hidden="true">
                <b>{Number(day.slice(-2))}</b>
                <small>
                  {formatDate(day, {
                    weekday: undefined,
                    day: undefined,
                    month: 'short',
                  })}
                </small>
              </span>
              <h3 id={`upcoming-${day}`}>
                {day === addDays(now.date, 1)
                  ? 'Demain'
                  : formatDate(day, {
                      weekday: 'long',
                      day: undefined,
                      month: undefined,
                    })}
                <small>
                  <time dateTime={day}>
                    {formatDate(day, {
                      weekday: undefined,
                      year: 'numeric',
                    })}
                  </time>
                </small>
              </h3>
              <span className="upcoming-day-count">
                {items.length} séance{items.length > 1 ? 's' : ''}
              </span>
            </div>
            {rows(items)}
          </section>
        ))
      ) : (
        <p className="empty-inline">Aucune autre séance prévue.</p>
      )}
      <Link className="archive-link" to="/coach/sessions">
        <Icon name="history" />
        Reprendre une séance passée
        <Icon name="arrow" />
      </Link>
    </section>
  )
  return (
    <>
      <div className="coach-title">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" />
            {formatDate(now.date)}
          </p>
          <h1>
            {history
              ? 'Séances passées'
              : upcomingView
                ? 'Prochaines séances'
                : 'Le planning'}
          </h1>
          <p className="page-subtitle">
            {history
              ? 'Retrouvez un entraînement. Préparez le suivant.'
              : upcomingView
                ? 'Tout ce qui est programmé après aujourd’hui.'
                : 'Votre salle. Votre programmation.'}
          </p>
        </div>
        <Link className="button primary" to="/coach/sessions/new">
          <Icon name="plus" />
          Créer une séance
        </Link>
      </div>
      {notice && (
        <div role="status" className="success-message">
          <Icon name="check" />
          <p>{notice}</p>
          <button
            aria-label="Fermer la confirmation"
            className="text-button"
            onClick={() => setNotice('')}
          >
            <Icon name="close" />
          </button>
        </div>
      )}
      {status === 'loading' && (
        <StatePanel title="Chargement du planning" message="Un instant…" />
      )}
      {status === 'error' && (
        <StatePanel
          type="error"
          title="Planning indisponible"
          message={error}
          action={
            <button className="button primary" onClick={() => refresh()}>
              Réessayer
            </button>
          }
        />
      )}
      {status !== 'loading' && upcomingView && upcomingSection}
      {status !== 'loading' && !history && !upcomingView && (
        <>
          <section
            className="live-planning"
            aria-label="Séances en cours et à venir"
          >
            <div
              className={`session-spotlight ${schedule.current ? 'is-live' : ''}`}
            >
              <div className="spotlight-top">
                <p className="eyebrow">
                  <span className="status-dot" />
                  {schedule.current
                    ? 'En cours'
                    : featured
                      ? 'Prochaine séance'
                      : 'Votre programmation'}
                </p>
                <span>
                  <Icon name="clock" />
                  {now.time}
                </span>
              </div>
              <div className="spotlight-body">
                <div>
                  <h2>
                    {featured?.title ||
                      (featured
                        ? FORMAT_LABELS[featured.wod?.format]
                        : 'La suite se prépare ici.')}
                  </h2>
                  <p>
                    {featured
                      ? `${formatDate(featured.session_date)} · ${slotLabel(featured)}`
                      : 'Aucune séance prévue. Ajoutez le prochain entraînement de la box.'}
                  </p>
                </div>
                {featured?.wod?.format && (
                  <div className="spotlight-format">
                    <strong>{FORMAT_LABELS[featured.wod.format]}</strong>
                    <span>
                      {featured.wod.duration_or_target || 'WOD du jour'}
                    </span>
                  </div>
                )}
              </div>
              {featured && (
                <div className="spotlight-bottom">
                  <span>
                    {featured.wod?.movements?.length || 0} mouvements au
                    programme
                  </span>
                  <Link
                    aria-label="Ouvrir la séance à l’affiche"
                    to={`/coach/sessions/${featured.id}/edit`}
                  >
                    <Icon name="arrow" />
                  </Link>
                </div>
              )}
              {schedule.current && (
                <div
                  className="session-elapsed"
                  role="progressbar"
                  aria-label="Avancement du créneau"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(elapsed)}
                >
                  <span style={{ width: `${elapsed}%` }} />
                </div>
              )}
            </div>
            <div className="next-session">
              <div className="next-session-heading">
                <span className="next-icon">
                  <Icon name="arrow" />
                </span>
                <p className="eyebrow">
                  {schedule.current ? 'Prochaine séance' : 'À suivre'}
                </p>
              </div>
              <h2>
                {following?.title ||
                  (following
                    ? FORMAT_LABELS[following.wod?.format]
                    : 'Planning à compléter')}
              </h2>
              <p>
                {following
                  ? `${formatDate(following.session_date)} · ${slotLabel(following)}`
                  : 'Aucune autre séance prévue.'}
              </p>
              <Link
                className="text-link"
                to={
                  following
                    ? `/coach/sessions/${following.id}/edit`
                    : '/coach/sessions/new'
                }
              >
                {following ? 'Voir la programmation' : 'Programmer une séance'}
                <Icon name="arrow" />
              </Link>
            </div>
          </section>
          <section
            className={`programme-brief ${featured ? '' : 'has-no-session'}`}
            aria-label="Programme à l’affiche"
          >
            <div className="programme-brief-heading">
              <div>
                <p className="eyebrow">LA SÉANCE À L’AFFICHE</p>
                <h2>En un coup d’œil</h2>
              </div>
              <Link to="/screen" target="_blank" rel="noreferrer">
                <Icon name="screen" />
                Ouvrir la vue TV
                <Icon name="arrow" />
              </Link>
            </div>
            <LiveTvEmbed />
            {featured && (
              <>
                <div
                  className="programme-brief-cards"
                  tabIndex="0"
                  role="region"
                  aria-label="Étapes de la séance"
                >
                  <div className="programme-brief-card">
                    <strong>Échauffement</strong>
                    <p>
                      {phaseText(
                        featured.warmup?.general,
                        'À préciser par le coach',
                      )}
                    </p>
                  </div>
                  <div
                    className={`programme-brief-card ${featured.skill_strength ? '' : 'is-skipped'}`}
                  >
                    <strong>
                      {!featured.skill_strength
                        ? 'Skill / Strength'
                        : featured.skill_strength.kind === 'strength'
                          ? 'Force'
                          : 'Technique'}
                    </strong>
                    <p>
                      {!featured.skill_strength
                        ? 'Pas de bloc pour cette séance'
                        : featured.skill_strength.movements?.[0]
                            ?.movement_name || 'À préciser par le coach'}
                    </p>
                  </div>
                  <div className="programme-brief-card is-wod">
                    <strong>
                      {FORMAT_LABELS[featured.wod?.format] || 'WOD'}
                    </strong>
                    <p>
                      {featured.wod?.movements
                        ?.map((item) => item.movement_name)
                        .filter(Boolean)
                        .join(' · ') || 'Mouvements à préciser'}
                    </p>
                  </div>
                </div>
                <p className="programme-swipe-hint">
                  Glissez pour voir les trois étapes →
                </p>
              </>
            )}
          </section>
          <div className="planning-columns">
            <section className="planning-section day-planning">
              <div className="section-heading">
                <h2>Cette semaine</h2>
              </div>
              <div
                className="week-strip"
                role="group"
                aria-label="Choisir un jour"
              >
                {Array.from({ length: 7 }, (_, i) => {
                  const day = addDays(now.date, i)
                  const count = sessions.filter(
                    (s) => s.session_date === day,
                  ).length
                  return (
                    <button
                      key={day}
                      aria-pressed={date === day}
                      aria-label={`${formatDate(day)}, ${count} séance${count > 1 ? 's' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <span>
                        {formatDate(day, {
                          weekday: 'short',
                          day: undefined,
                          month: undefined,
                        }).replace('.', '')}
                      </span>
                      <strong>{Number(day.slice(-2))}</strong>
                      <i className={count ? 'has-sessions' : ''} />
                    </button>
                  )
                })}
              </div>
              <div className="section-heading day-heading" aria-live="polite">
                <h2>
                  {date === now.date
                    ? 'Aujourd’hui'
                    : formatDate(date, { month: 'short' })}
                </h2>
                <span>
                  {daySessions.length} séance{daySessions.length > 1 ? 's' : ''}
                </span>
              </div>
              <div key={date} className="day-sessions">
                {daySessions.length ? (
                  rows(daySessions)
                ) : (
                  <div className="empty-day">
                    <Icon name="calendar" />
                    <p>
                      {date === now.date
                        ? 'Aucune séance prévue aujourd’hui.'
                        : 'Aucune séance prévue ce jour.'}
                    </p>
                    <Link
                      className="text-link"
                      to={`/coach/sessions/new?date=${date}`}
                    >
                      Programmer ce jour <Icon name="plus" />
                    </Link>
                  </div>
                )}
              </div>
            </section>
            {upcomingSection}
          </div>
        </>
      )}
      {status !== 'loading' && history && (
        <section className="planning-section">
          <label className="history-search">
            <Icon name="search" />
            <span className="sr-only">Rechercher une séance passée</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Titre, format, date…"
            />
          </label>
          {past.length ? (
            rows(past)
          ) : (
            <StatePanel
              type="empty"
              title={
                search
                  ? 'Aucune séance correspondante'
                  : 'Pas encore d’historique'
              }
              message={
                search
                  ? 'Essayez un autre titre, format ou jour.'
                  : 'Les séances terminées apparaîtront ici.'
              }
            />
          )}
        </section>
      )}
      {deleting && (
        <ConfirmDialog
          title="Supprimer cette séance ?"
          confirmLabel="Supprimer la séance"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        >
          <p>
            {formatDate(deleting.session_date)} · {slotLabel(deleting)}
          </p>
          <p>Cette suppression est définitive.</p>
          {actionError && (
            <p role="alert" className="form-error">
              {actionError}
            </p>
          )}
        </ConfirmDialog>
      )}
    </>
  )
}
