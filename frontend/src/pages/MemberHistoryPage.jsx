import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMember } from '../state/MemberContext.jsx'
import { loadPast, loadSession } from '../services/publicSessions.js'
import { parisNow, slotLabel } from '../lib/schedule.js'
import { FORMAT_LABELS, shortDate, withoutDashes } from '../lib/format.js'
import SessionPhases from '../components/SessionPhases.jsx'
import ScoreCard from '../components/ScoreCard.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import MemberLocked from '../components/MemberLocked.jsx'
import StatePanel from '../components/StatePanel.jsx'
import Icon from '../components/Icon.jsx'
import { SessionHero } from './MemberSessionPage.jsx'

const medal = (rank) => (rank === 1 ? 'is-gold' : rank === 2 ? 'is-silver' : rank === 3 ? 'is-bronze' : '')

// Past sessions are for members only: a guest sees the locked screen.
export default function MemberHistoryPage() {
  const { member, token, adapter, mode } = useMember()
  const [data, setData] = useState({ status: 'loading', scores: [], past: [] })
  useEffect(() => {
    if (!member) return
    let active = true
    Promise.all([adapter.scores(token), loadPast(mode, parisNow().date)])
      .then(([scores, past]) => active && setData({ status: 'ready', scores, past }))
      .catch(() => active && setData({ status: 'error', scores: [], past: [] }))
    return () => {
      active = false
    }
  }, [adapter, member, mode, token])

  if (!member)
    return (
      <MemberLocked title="Tes séances passées">
        L’historique des séances, tes scores et ton classement sont gardés dans ton compte.
      </MemberLocked>
    )
  if (data.status === 'loading') return <StatePanel title="Chargement de tes séances" message="Un instant…" />
  if (data.status === 'error')
    return <StatePanel type="error" title="Historique indisponible" message="Vérifie le réseau puis réessaie." />
  const scored = new Set(data.scores.map((score) => String(score.wod_id)))
  return (
    <div className="member-page">
      <section className="member-title">
        <p className="eyebrow">MES SÉANCES</p>
        <h1>Ton historique</h1>
      </section>
      <section className="member-card">
        <h2>
          <Icon name="trophy" /> Mes scores
        </h2>
        {data.scores.length ? (
          <ul className="history-list">
            {data.scores.map((score) => (
              <li key={score.id}>
                <Link to={`/moi/seances/${score.wod_id}`}>
                  <span className={`history-rank ${medal(score.rank)}`}>
                    {score.rank}
                    <small>/{score.participants}</small>
                  </span>
                  <span className="history-main">
                    <b>{withoutDashes(score.title) || 'Entraînement'}</b>
                    <small>
                      {shortDate(score.session_date)} · {FORMAT_LABELS[score.format]} · {score.category}
                    </small>
                  </span>
                  <strong>{score.result_display}</strong>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Pas encore de score. Valide ta prochaine séance pour lancer ton historique !</p>
        )}
      </section>
      <section className="member-card">
        <h2>
          <Icon name="history" /> Séances passées de la box
        </h2>
        {data.past.length ? (
          <ul className="history-list">
            {data.past.map((session) => (
              <li key={session.id}>
                <Link to={`/moi/seances/${session.id}`}>
                  <span className="history-date">
                    <b>{Number(session.session_date.slice(-2))}</b>
                    <small>{shortDate(session.session_date).split(' ').slice(-1)}</small>
                  </span>
                  <span className="history-main">
                    <b>{withoutDashes(session.title) || 'Entraînement'}</b>
                    <small>
                      {slotLabel(session)} · {FORMAT_LABELS[session.format || session.wod?.format] || 'Séance'}
                    </small>
                  </span>
                  {scored.has(String(session.id)) ? <Icon name="check" /> : <Icon name="arrow" />}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Aucune séance passée pour le moment.</p>
        )}
      </section>
    </div>
  )
}

// One past (or today's) session: its phases, my score and the leaderboard.
export function MemberSessionDetailPage() {
  const { id } = useParams()
  const { member, mode } = useMember()
  const [state, setState] = useState({ status: 'loading', session: null })
  const [fresh, setFresh] = useState(null)
  useEffect(() => {
    if (!member) return
    let active = true
    loadSession(mode, id)
      .then((session) => active && setState({ status: session ? 'ready' : 'missing', session }))
      .catch(() => active && setState({ status: 'missing', session: null }))
    return () => {
      active = false
    }
  }, [id, member, mode])
  if (!member)
    return (
      <MemberLocked title="Séance réservée aux membres">
        Crée ton compte pour revoir les séances passées et leur classement.
      </MemberLocked>
    )
  if (state.status === 'loading') return <StatePanel title="Chargement de la séance" message="Un instant…" />
  if (state.status === 'missing')
    return (
      <StatePanel
        type="empty"
        title="Séance introuvable"
        message="Elle a peut-être été supprimée par le coach."
        action={
          <Link className="button primary" to="/moi/seances">
            Mes séances
          </Link>
        }
      />
    )
  const { session } = state
  const future = session.session_date > parisNow().date
  return (
    <div className="member-page">
      <Link className="text-link member-back" to="/moi/seances">
        ← Mes séances
      </Link>
      <SessionHero session={session} />
      <SessionPhases session={session} />
      {!future && <ScoreCard session={session} onSaved={setFresh} />}
      {session.wod && <Leaderboard wodId={session.id} board={fresh} />}
    </div>
  )
}
