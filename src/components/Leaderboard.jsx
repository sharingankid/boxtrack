import { formatResult } from '../lib/format.js'

const CATEGORIES = ['RX', 'Scaled', 'Modified']

export default function Leaderboard({ format, rankings, onRemove }) {
  const hasAnyScore = CATEGORIES.some((category) => rankings?.[category]?.length)
  if (!hasAnyScore) return <p className="muted">Aucun score enregistré pour cette séance.</p>

  return (
    <div className="leaderboard">
      {CATEGORIES.filter((category) => rankings[category]?.length).map((category) => (
        <div className="leaderboard-category" key={category}>
          <h3>{category}</h3>
          <ol>
            {rankings[category].map((entry) => (
              <li key={entry.id}>
                <span className="leaderboard-rank">{entry.rank}</span>
                <span className="leaderboard-name">{entry.athlete.first_name} {entry.athlete.last_name}</span>
                <span className="leaderboard-result">{formatResult(format, entry.result_value)}</span>
                {onRemove && <button type="button" className="icon-button" onClick={() => onRemove(entry)} aria-label={`Supprimer le score de ${entry.athlete.first_name}`}>×</button>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}
