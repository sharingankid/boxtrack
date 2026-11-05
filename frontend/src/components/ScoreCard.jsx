import { useEffect, useState } from 'react'
import { useMember } from '../state/MemberContext.jsx'
import { CATEGORIES, isTimeBased, parseResult } from '../lib/scoring.js'
import { formatElapsed } from '../lib/classTimer.js'
import { athleteById } from '../lib/avatars.js'
import { ATHLETES } from '../data/athletes.js'
import PixelAthlete from './PixelAthlete.jsx'
import Icon from './Icon.jsx'

const UNITS = { EMOM: 'reps', TABATA: 'reps', STRENGTH: 'kg' }

function Stepper({ label, value, onChange }) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <div>
        <button type="button" aria-label={`${label} moins un`} onClick={() => onChange(Math.max(0, value - 1))}>
          −
        </button>
        <output>{value}</output>
        <button type="button" aria-label={`${label} plus un`} onClick={() => onChange(value + 1)}>
          +
        </button>
      </div>
    </div>
  )
}

// "Valider ma séance": the member's own result for the WOD, by format (time,
// rounds + reps, reps, kg) and category, then the class leaderboard. A guest
// sees what an account unlocks instead.
export default function ScoreCard({ session, onSaved }) {
  const { member, token, adapter, leaveGuest } = useMember()
  const format = session.wod?.format
  const [category, setCategory] = useState('RX')
  const [time, setTime] = useState('')
  const [rounds, setRounds] = useState(0)
  const [reps, setReps] = useState(0)
  const [value, setValue] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [, setTick] = useState(0)
  const [state, setState] = useState({ busy: false, error: '', saved: null })
  useEffect(() => {
    if (!startedAt) return
    const timer = setInterval(() => setTick((tick) => tick + 1), 100)
    return () => clearInterval(timer)
  }, [startedAt])
  if (!session.wod) return null

  if (!member)
    return (
      <section className="member-card score-card is-locked">
        <h2>
          <Icon name="trophy" /> Ton score
        </h2>
        <div className="score-teaser" aria-hidden="true">
          {ATHLETES.slice(0, 3).map((athlete, index) => (
            <PixelAthlete key={athlete.id} athlete={athlete} move={index === 1 ? 'celebrate' : 'idle'} phase={index} compact />
          ))}
        </div>
        <p>
          Crée ton compte pour enregistrer ton score, entrer dans le classement de la classe et suivre
          ta progression.
        </p>
        <button className="button primary wide" onClick={leaveGuest}>
          <Icon name="user" />
          Créer mon compte
        </button>
      </section>
    )

  const payload = () =>
    format === 'AMRAP'
      ? { rounds, reps }
      : isTimeBased(format)
        ? { time }
        : { result_value: value === '' ? '' : Number(value) }
  const submit = async (event) => {
    event.preventDefault()
    setState({ busy: true, error: '', saved: null })
    try {
      parseResult(format, payload())
      const result = await adapter.submitScore(
        { wod_id: session.id, category, ...payload() },
        token,
      )
      setState({ busy: false, error: '', saved: result.score })
      onSaved?.(result.leaderboard)
    } catch (err) {
      setState({ busy: false, error: err.message, saved: null })
    }
  }
  const stopTimer = () => {
    setTime(formatElapsed(Date.now() - startedAt).slice(0, -2))
    setStartedAt(null)
  }

  return (
    <section className="member-card score-card">
      <h2>
        <Icon name="trophy" /> Valider ma séance
      </h2>
      {state.saved ? (
        <div className="score-saved" role="status">
          <PixelAthlete athlete={athleteById(member.avatar)} move="celebrate" />
          <div>
            <p className="eyebrow">SCORE ENREGISTRÉ</p>
            <strong>{state.saved.result_display}</strong>
            <span>
              {state.saved.rank}
              {state.saved.rank === 1 ? 'er' : 'e'} en {category}
            </span>
            <button className="text-button" onClick={() => setState({ busy: false, error: '', saved: null })}>
              Modifier mon score
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="score-form">
          {isTimeBased(format) && (
            <div className="wod-timer">
              <output className={startedAt ? 'is-running' : ''}>
                {startedAt ? formatElapsed(Date.now() - startedAt) : time || '00:00.0'}
              </output>
              {startedAt ? (
                <button type="button" className="button primary" onClick={stopTimer}>
                  <Icon name="stop" /> Stop
                </button>
              ) : (
                <button type="button" className="button" onClick={() => setStartedAt(Date.now())}>
                  <Icon name="play" /> Chrono WOD
                </button>
              )}
              <label>
                Mon temps
                <input
                  value={time}
                  inputMode="numeric"
                  placeholder="12:34"
                  onChange={(event) => setTime(event.target.value)}
                />
              </label>
            </div>
          )}
          {format === 'AMRAP' && (
            <div className="score-steppers">
              <Stepper label="Tours" value={rounds} onChange={setRounds} />
              <Stepper label="Reps en plus" value={reps} onChange={setReps} />
            </div>
          )}
          {!isTimeBased(format) && format !== 'AMRAP' && (
            <label>
              Mon résultat ({UNITS[format] || 'reps'})
              <input
                type="number"
                min="0"
                step={format === 'STRENGTH' ? '0.5' : '1'}
                inputMode="decimal"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </label>
          )}
          <div className="segmented" role="group" aria-label="Catégorie">
            {CATEGORIES.map((item) => (
              <button type="button" key={item} aria-pressed={item === category} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
          {state.error && (
            <p className="form-error" role="alert">
              {state.error}
            </p>
          )}
          <button className="button primary wide" disabled={state.busy}>
            <Icon name="check" />
            {state.busy ? 'Envoi…' : 'Enregistrer mon score'}
          </button>
        </form>
      )}
    </section>
  )
}
