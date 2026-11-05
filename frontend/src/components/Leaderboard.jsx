import { useEffect, useState } from 'react'
import { useMember } from '../state/MemberContext.jsx'
import { CATEGORIES } from '../lib/scoring.js'
import { athleteForEntry } from '../lib/avatars.js'
import PixelAthlete from './PixelAthlete.jsx'
import Icon from './Icon.jsx'

const fullName = (entry) => `${entry.athlete.first_name} ${entry.athlete.last_name?.[0] || ''}.`

// Class leaderboard of one WOD: a pixel podium for the top 3, then the rest.
// `board` (fresh from a score submission) wins over the periodic refresh.
export default function Leaderboard({ wodId, board: fresh }) {
  const { adapter, member } = useMember()
  const [board, setBoard] = useState(null)
  const [status, setStatus] = useState('loading')
  const [picked, setPicked] = useState(null)
  useEffect(() => {
    let active = true
    const load = () =>
      adapter
        .leaderboard(wodId)
        .then((data) => {
          if (active) {
            setBoard(data)
            setStatus('ready')
          }
        })
        .catch(() => active && setStatus((current) => (current === 'ready' ? current : 'error')))
    load()
    const timer = setInterval(load, 30000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [adapter, wodId])
  const shown = fresh || board
  if (!shown)
    return (
      <section className="member-card leaderboard">
        <h2>
          <Icon name="trophy" /> Classement
        </h2>
        <p className="muted">
          {status === 'error' ? 'Classement indisponible pour le moment.' : 'Chargement…'}
        </p>
      </section>
    )
  const mine = member
    ? CATEGORIES.find((category) =>
        shown.rankings[category]?.some((entry) => entry.athlete.id === member.id),
      )
    : null
  const category =
    picked || mine || CATEGORIES.find((item) => shown.rankings[item]?.length) || 'RX'
  const ranking = shown.rankings[category] || []
  const podium = [ranking[1], ranking[0], ranking[2]]
  return (
    <section className="member-card leaderboard">
      <h2>
        <Icon name="trophy" /> Classement de la classe
      </h2>
      <div className="segmented" role="group" aria-label="Catégorie">
        {CATEGORIES.map((item) => (
          <button key={item} aria-pressed={item === category} onClick={() => setPicked(item)}>
            {item} <small>{shown.rankings[item]?.length || 0}</small>
          </button>
        ))}
      </div>
      {ranking.length ? (
        <>
          <div className="podium" aria-hidden="true">
            {podium.map((entry, index) =>
              entry ? (
                <div key={entry.athlete.id} className={`podium-step step-${[2, 1, 3][index]}`}>
                  <PixelAthlete
                    athlete={athleteForEntry(entry, member)}
                    move={entry.rank === 1 ? 'celebrate' : 'idle'}
                    phase={index}
                    compact
                  />
                  <b>{fullName(entry)}</b>
                  <span>{entry.result_display}</span>
                  <i>{entry.rank}</i>
                </div>
              ) : (
                <div key={index} className={`podium-step step-${[2, 1, 3][index]} is-empty`}>
                  <i>{[2, 1, 3][index]}</i>
                </div>
              ),
            )}
          </div>
          <ol className="ranking-list">
            {ranking.map((entry) => (
              <li
                key={entry.athlete.id}
                className={member && entry.athlete.id === member.id ? 'is-me' : ''}
              >
                <span className="ranking-rank">{entry.rank}</span>
                <span className="ranking-name">
                  {fullName(entry)}
                  {member && entry.athlete.id === member.id && <em>Toi</em>}
                </span>
                <b>{entry.result_display}</b>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="muted">Personne n’a encore de score en {category}. À toi de jouer !</p>
      )}
    </section>
  )
}
