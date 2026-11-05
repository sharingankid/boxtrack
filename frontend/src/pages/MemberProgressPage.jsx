import { useEffect, useState } from 'react'
import { useMember } from '../state/MemberContext.jsx'
import { parisNow } from '../lib/schedule.js'
import { FORMAT_LABELS, shortDate } from '../lib/format.js'
import { athleteById } from '../lib/avatars.js'
import {
  LEVEL_XP,
  experience,
  placementHistory,
  records,
  summary,
  weekStreak,
  weeklyCounts,
} from '../lib/progress.js'
import MemberLocked from '../components/MemberLocked.jsx'
import StatePanel from '../components/StatePanel.jsx'
import PixelAthlete from '../components/PixelAthlete.jsx'
import Icon from '../components/Icon.jsx'

// Sessions per week: bars grow in one after the other.
function WeeklyChart({ weeks }) {
  const max = Math.max(1, ...weeks.map((week) => week.count))
  return (
    <div className="week-chart" role="img" aria-label="Séances par semaine sur les 8 dernières semaines">
      {weeks.map((week, index) => (
        <div key={week.start} className="week-bar">
          <span style={{ '--h': `${(week.count / max) * 100}%`, '--i': index }}>
            {week.count > 0 && <b>{week.count}</b>}
          </span>
          <small>{shortDate(week.start).split(' ').slice(1, 2)}</small>
        </div>
      ))}
    </div>
  )
}

// Place in the class over time (100 = first): the line draws itself and the
// member's athlete stands on the latest point.
function PlacementChart({ points, athlete }) {
  if (points.length < 2)
    return <p className="muted">Encore {2 - points.length} score pour voir ta courbe.</p>
  const width = 300
  const height = 120
  const x = (index) => 12 + (index / (points.length - 1)) * (width - 24)
  const y = (value) => 10 + (1 - value / 100) * (height - 20)
  const path = points.map((point, index) => `${x(index)},${y(point.percentile)}`).join(' ')
  const last = points[points.length - 1]
  return (
    <div className="placement-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Ta place dans la classe, dernière séance : ${last.percentile} sur 100`}>
        {[0, 50, 100].map((value) => (
          <line key={value} x1="0" x2={width} y1={y(value)} y2={y(value)} className="chart-grid" />
        ))}
        <polyline points={path} className="chart-line" pathLength="1" />
        {points.map((point, index) => (
          <circle key={point.id} cx={x(index)} cy={y(point.percentile)} r="3.5" className="chart-dot" />
        ))}
      </svg>
      <div
        className="placement-athlete"
        style={{ left: `${(x(points.length - 1) / width) * 100}%`, top: `${(y(last.percentile) / height) * 100}%` }}
        aria-hidden="true"
      >
        <PixelAthlete athlete={athlete} move={last.percentile >= 67 ? 'celebrate' : 'run'} compact />
      </div>
      <p className="chart-legend">
        <span>Dernier de la classe</span>
        <span>Premier</span>
      </p>
    </div>
  )
}

export default function MemberProgressPage() {
  const { member, token, adapter } = useMember()
  const [state, setState] = useState({ status: 'loading', scores: [] })
  useEffect(() => {
    if (!member) return
    let active = true
    adapter
      .scores(token)
      .then((scores) => active && setState({ status: 'ready', scores }))
      .catch(() => active && setState({ status: 'error', scores: [] }))
    return () => {
      active = false
    }
  }, [adapter, member, token])
  if (!member)
    return (
      <MemberLocked title="Ta progression">
        Ton niveau, tes records, ta série de semaines et ta place dans la classe au fil du temps.
      </MemberLocked>
    )
  if (state.status === 'loading') return <StatePanel title="Calcul de ta progression" message="Un instant…" />
  if (state.status === 'error')
    return <StatePanel type="error" title="Progression indisponible" message="Vérifie le réseau puis réessaie." />
  const { scores } = state
  const today = parisNow().date
  const xp = experience(scores)
  const totals = summary(scores)
  const streak = weekStreak(scores, today)
  const athlete = athleteById(member.avatar)
  return (
    <div className="member-page">
      <section className="level-card">
        <PixelAthlete athlete={athlete} move={scores.length ? 'celebrate' : 'idle'} />
        <div>
          <p className="eyebrow">NIVEAU</p>
          <strong className="level-number">{xp.level}</strong>
          <div
            className="xp-bar"
            role="progressbar"
            aria-label="Expérience vers le niveau suivant"
            aria-valuemin={0}
            aria-valuemax={LEVEL_XP}
            aria-valuenow={xp.xp % LEVEL_XP}
          >
            <span style={{ '--p': `${xp.progress * 100}%` }} />
          </div>
          <small>
            {xp.xp % LEVEL_XP} / {LEVEL_XP} XP · 100 par séance, +50 pour une victoire
          </small>
        </div>
      </section>
      <section className="stat-grid">
        <div>
          <b>{totals.sessions}</b>
          <small>séances</small>
        </div>
        <div>
          <b>{totals.podiums}</b>
          <small>podiums</small>
        </div>
        <div>
          <b>{totals.wins}</b>
          <small>victoires</small>
        </div>
        <div className={streak ? 'is-hot' : ''}>
          <b>{streak}</b>
          <small>semaine{streak > 1 ? 's' : ''} d’affilée</small>
        </div>
      </section>
      <section className="member-card">
        <h2>
          <Icon name="chart" /> Séances par semaine
        </h2>
        <WeeklyChart weeks={weeklyCounts(scores, today)} />
      </section>
      <section className="member-card">
        <h2>
          <Icon name="trophy" /> Ta place dans la classe
        </h2>
        <PlacementChart points={placementHistory(scores)} athlete={athlete} />
      </section>
      <section className="member-card">
        <h2>
          <Icon name="bolt" /> Tes records
        </h2>
        {records(scores).length ? (
          <ul className="record-list">
            {records(scores).map((record) => (
              <li key={record.format}>
                <span>{FORMAT_LABELS[record.format]}</span>
                <b>{record.result_display}</b>
                <small>{shortDate(record.session_date)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Tes meilleurs résultats par format apparaîtront ici.</p>
        )}
      </section>
    </div>
  )
}
