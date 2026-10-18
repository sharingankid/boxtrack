import { useEffect, useState } from 'react'
import Leaderboard from './Leaderboard.jsx'
import { computeDemoLeaderboard, demoScoresBySessionId } from '../data/demoScores.js'
import { clockToSeconds, isTimeBasedFormat } from '../lib/format.js'
import { apiClient } from '../services/apiClient.js'
import { useAthletes } from '../state/AthletesContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'

export default function ScoreEntryForm({ wodId, format }) {
  const { mode, session: auth } = useAuth()
  const { athletes } = useAthletes()
  const activeAthletes = athletes.filter((a) => a.active)

  const [leaderboard, setLeaderboard] = useState(null)
  const [athleteId, setAthleteId] = useState('')
  const [category, setCategory] = useState('RX')
  const [result, setResult] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const timeBased = isTimeBasedFormat(format)

  const load = () => {
    if (mode === 'demo') {
      setLeaderboard(computeDemoLeaderboard(wodId, format))
      return
    }
    apiClient.leaderboard(wodId).then(setLeaderboard).catch((err) => setMessage(`Erreur : ${err.message}`))
  }

  useEffect(load, [wodId, format, mode])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const result_value = timeBased ? clockToSeconds(result) : Number(result)
    if (!athleteId || result_value === null || Number.isNaN(result_value)) {
      setMessage(timeBased ? 'Format attendu : MM:SS' : 'Entrez un nombre valide.')
      setSaving(false)
      return
    }
    try {
      if (mode === 'demo') {
        demoScoresBySessionId[wodId] = demoScoresBySessionId[wodId] || []
        demoScoresBySessionId[wodId] = [
          ...demoScoresBySessionId[wodId].filter((s) => s.athlete_id !== Number(athleteId)),
          { id: Date.now(), athlete_id: Number(athleteId), category, result_value },
        ]
      } else {
        await apiClient.recordScore(wodId, { athlete_id: Number(athleteId), category, result_value }, auth.token)
      }
      setResult('')
      load()
    } catch (err) {
      setMessage(`Erreur : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const removeScore = async (entry) => {
    if (mode === 'demo') {
      demoScoresBySessionId[wodId] = (demoScoresBySessionId[wodId] || []).filter((s) => s.id !== entry.id)
      load()
      return
    }
    try {
      await apiClient.removeScore(entry.id, auth.token)
      load()
    } catch (err) {
      setMessage(`Erreur : ${err.message}`)
    }
  }

  return (
    <div>
      {message && <p className="save-message" role="status">{message}</p>}
      <form className="score-entry-form" onSubmit={submit}>
        <select aria-label="Athlète" required value={athleteId} onChange={(e) => setAthleteId(e.target.value)}>
          <option value="">Athlète…</option>
          {activeAthletes.map((a) => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
        </select>
        <div className="segmented">
          {['RX', 'Scaled', 'Modified'].map((c) => (
            <button type="button" key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <input
          aria-label="Résultat"
          required
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder={timeBased ? 'MM:SS' : 'Reps, rounds ou kg'}
        />
        <button className="button primary small" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer le score'}</button>
      </form>
      {activeAthletes.length === 0 && <p className="muted">Ajoutez d’abord des athlètes dans l’onglet Athlètes.</p>}
      <div className="leaderboard-admin">
        {leaderboard ? <Leaderboard format={format} rankings={leaderboard.rankings} onRemove={removeScore} /> : <p className="muted">Chargement…</p>}
      </div>
    </div>
  )
}
