import { useEffect, useState } from 'react'
import { movementDetail } from '../services/sessionAdapter.js'
import { ATHLETES } from '../data/athletes.js'
import { formatElapsed } from '../lib/classTimer.js'
import { movementAnimation } from '../lib/movementAnimation.js'
import { isFrontMove } from '../lib/athletePoses.js'
import Icon from './Icon.jsx'
import PixelAthlete from './PixelAthlete.jsx'

const AVATAR_KEY = 'boxtrack.member.avatar'
const blankProgress = { checked: [], times: {}, active: null }
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Private mode: progress lasts for this visit only. */
  }
}

// Members tick the coach's exercises; Start / Stop times one exercise while
// their pixel athlete does the movement. Everything stays on this phone.
// `avatarId`: a member's own athlete (account); otherwise the visitor picks one.
export default function ExerciseChecklist({ session, movements, avatarId }) {
  const key = `boxtrack.checklist.${session.id}.${session.session_date}`
  const [progress, setProgress] = useState(() => {
    const stored = read(key, {})
    // The first version stored only the ticked indexes.
    return Array.isArray(stored)
      ? { ...blankProgress, checked: stored }
      : { ...blankProgress, ...stored }
  })
  const [picked, setAvatar] = useState(() =>
    Math.min(Number(read(AVATAR_KEY, 0)) || 0, ATHLETES.length - 1),
  )
  const owned = ATHLETES.findIndex((athlete) => athlete.id === avatarId)
  const avatar = owned >= 0 ? owned : picked
  const [cheer, setCheer] = useState(null)
  const [, setTick] = useState(0)
  const { checked, times, active } = progress
  const save = (next) => {
    setProgress(next)
    write(key, next)
  }

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => setTick((value) => value + 1), 100)
    return () => clearInterval(interval)
  }, [active])
  useEffect(() => {
    if (!cheer) return
    const timeout = setTimeout(() => setCheer(null), 2200)
    return () => clearTimeout(timeout)
  }, [cheer])

  const toggle = (index) => {
    const isChecked = checked.includes(index)
    const nextTimes = { ...times }
    if (isChecked) delete nextTimes[index]
    save({
      ...progress,
      checked: isChecked
        ? checked.filter((item) => item !== index)
        : [...checked, index],
      times: nextTimes,
    })
  }
  const start = (index) => {
    setCheer(null)
    save({ ...progress, active: { index, startedAt: Date.now() } })
  }
  const stop = () => {
    const time = Date.now() - active.startedAt
    save({
      checked: checked.includes(active.index)
        ? checked
        : [...checked, active.index],
      times: { ...times, [active.index]: time },
      active: null,
    })
    setCheer({ index: active.index, time })
  }
  const chooseAvatar = (index) => {
    setAvatar(index)
    write(AVATAR_KEY, index)
  }

  const done = movements.filter((_, index) => checked.includes(index)).length
  const stage = active ?? cheer
  const stageMovement = stage && movements[stage.index]
  const elapsed = active ? Date.now() - active.startedAt : 0
  const stageMove =
    active && stageMovement
      ? movementAnimation(stageMovement.movement_name)
      : 'celebrate'
  // The next exercise to do gets a pulsing Start button.
  const nextIndex = active ? -1 : movements.findIndex((_, index) => !checked.includes(index))

  return (
    <div className="exercise-checklist">
      {owned < 0 && (
      <div className="athlete-picker" role="group" aria-label="Choisis ton athlète">
        <p className="eyebrow">TON ATHLÈTE</p>
        <div>
          {ATHLETES.map((athlete, index) => (
            <button
              key={athlete.id}
              aria-pressed={avatar === index}
              aria-label={athlete.label}
              onClick={() => chooseAvatar(index)}
            >
              <PixelAthlete
                athlete={athlete}
                compact
                still={avatar !== index}
                phase={index}
              />
            </button>
          ))}
        </div>
      </div>
      )}
      {stageMovement && (
        <div
          className={`exercise-stage ${cheer && !active ? 'is-cheer' : ''}`}
          aria-live="polite"
        >
          <div className="exercise-avatar">
            <PixelAthlete
              athlete={ATHLETES[avatar]}
              move={stageMove}
              view={isFrontMove(stageMove) ? 'full' : 'side'}
              sweat={elapsed > 8000}
            />
          </div>
          <div className="exercise-stage-info">
            <p className="eyebrow">{active ? 'EN COURS' : 'BRAVO !'}</p>
            <h4>{stageMovement.movement_name}</h4>
            {movementDetail(stageMovement) && (
              <p className="muted">{movementDetail(stageMovement)}</p>
            )}
            <p className="exercise-clock" role="timer">
              {formatElapsed(active ? elapsed : cheer.time)}
            </p>
            {active && (
              <button className="button primary exercise-stop" onClick={stop}>
                <Icon name="stop" />
                Stop, j’ai fini
              </button>
            )}
          </div>
        </div>
      )}

      <ul className="home-checklist" aria-label="Exercices à valider">
        {movements.map((item, index) => (
          <li
            key={`${item.movement_name}-${index}`}
            className={`${active?.index === index ? 'is-active' : ''} ${checked.includes(index) ? 'is-done' : ''}`}
          >
            <label>
              <input
                type="checkbox"
                checked={checked.includes(index)}
                onChange={() => toggle(index)}
              />
              <b>{item.movement_name}</b>
              <small>
                {times[index] !== undefined
                  ? formatElapsed(times[index])
                  : movementDetail(item)}
              </small>
            </label>
            {!checked.includes(index) && (
              <button
                className={`exercise-start ${index === nextIndex ? 'is-next' : ''}`}
                disabled={!!active}
                onClick={() => start(index)}
                aria-label={`Démarrer ${item.movement_name}`}
              >
                <span className="exercise-start-icon">
                  <Icon name="play" />
                </span>
                Start
              </button>
            )}
          </li>
        ))}
      </ul>
      <p
        className={`home-checklist-progress ${done === movements.length ? 'is-done' : ''}`}
        aria-live="polite"
      >
        {done === movements.length ? (
          <>
            <Icon name="check" />
            WOD validé
          </>
        ) : (
          `${done}/${movements.length} exercices validés`
        )}
      </p>
    </div>
  )
}
