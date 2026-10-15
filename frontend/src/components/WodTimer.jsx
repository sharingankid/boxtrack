import { useCallback, useEffect, useRef, useState } from 'react'
import { FORMAT_LABELS } from '../lib/format.js'
import { formatClock, REST_PRESETS, timerPlan, timerState } from '../lib/timer.js'

const PRESTART = 10

// Short beeps for the last seconds, a long one when a segment starts or the WOD ends.
function useBeeper() {
  const context = useRef(null)
  const unlock = () => {
    try {
      context.current ??= new (window.AudioContext || window.webkitAudioContext)()
      context.current.resume()
    } catch { /* No audio available: the timer stays visual. */ }
  }
  const beep = useCallback((long = false) => {
    const audio = context.current
    if (!audio) return
    const duration = long ? .7 : .18
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = 'square'
    oscillator.frequency.value = long ? 1046 : 784
    gain.gain.setValueAtTime(.15, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration)
    oscillator.connect(gain).connect(audio.destination)
    oscillator.start()
    oscillator.stop(audio.currentTime + duration)
  }, [])
  useEffect(() => () => { context.current?.close().catch(() => {}) }, [])
  return { unlock, beep }
}

export default function WodTimer({ session, onClose }) {
  const [plan, setPlan] = useState(() => timerPlan(session.wod))
  const [status, setStatus] = useState('idle')
  const [elapsed, setElapsed] = useState(-PRESTART)
  const [rounds, setRounds] = useState(0)
  const clock = useRef({ base: -PRESTART, startedAt: 0 })
  const lastTick = useRef(null)
  const closeRef = useRef(null)
  const { unlock, beep } = useBeeper()

  const start = () => {
    unlock()
    clock.current = { base: elapsed, startedAt: performance.now() }
    lastTick.current = null
    setStatus('running')
  }
  const pause = () => {
    clock.current.base = elapsed
    setStatus('paused')
  }
  const reset = () => {
    setStatus('idle'); setElapsed(-PRESTART); setRounds(0)
  }
  const toggle = () => (status === 'running' ? pause() : status === 'done' ? reset() : start())

  useEffect(() => {
    if (status !== 'running') return
    let lock = null
    navigator.wakeLock?.request('screen').then((value) => { lock = value }).catch(() => {})
    const timer = setInterval(() => setElapsed(clock.current.base + (performance.now() - clock.current.startedAt) / 1000), 100)
    return () => { clearInterval(timer); lock?.release().catch(() => {}) }
  }, [status])

  const pre = elapsed < 0
  const state = pre ? null : timerState(plan, elapsed)

  useEffect(() => {
    if (status !== 'running') return
    const remaining = pre ? Math.ceil(-elapsed) : Math.ceil(state.remaining)
    const tick = pre ? `pre-${remaining}` : `${state.index}-${remaining}`
    if (tick === lastTick.current) return
    const previous = lastTick.current
    lastTick.current = tick
    if (state?.done) { beep(true); setStatus('done'); return }
    if (previous === null) return
    if (pre) { if (remaining <= 3) beep(); return }
    if (previous.startsWith('pre-') || Number(previous.split('-')[0]) !== state.index) beep(true)
    else if (remaining <= 3 && Number.isFinite(state.segment.seconds)) beep()
  }, [elapsed, status, pre, state, beep])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.code === 'Space' && event.target.tagName !== 'BUTTON') { event.preventDefault(); toggle() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => { document.body.style.overflow = previous }
  }, [])

  const segment = state?.segment || plan.segments[0]
  const next = state ? plan.segments[state.index + 1] : null
  const finite = Number.isFinite(segment.seconds)
  const display = pre && status !== 'idle'
    ? String(Math.ceil(-elapsed))
    : plan.mode === 'up' ? formatClock(Math.floor(Math.max(0, elapsed))) : formatClock(Math.ceil(state ? state.remaining : segment.seconds))
  const progress = state && finite ? Math.min(1, state.inSegment / segment.seconds) : 0
  const warning = status === 'running' && !pre && finite && state.remaining <= 3
  const phase = status === 'done' ? 'Terminé' : pre && status !== 'idle' ? 'Préparez-vous' : segment.type === 'rest' ? 'Repos' : 'Travail'

  return (
    <div className={`wod-timer ${segment.type} ${status} ${warning ? 'warning' : ''}`} role="dialog" aria-modal="true" aria-label="Timer de la séance">
      <header className="wod-timer-top">
        <div>
          <p className="eyebrow">{FORMAT_LABELS[session.wod?.format] || 'WOD'}{session.wod?.duration_or_target ? ` · ${session.wod.duration_or_target}` : ''}</p>
          <p className="wod-timer-summary">{plan.summary}</p>
        </div>
        <button ref={closeRef} type="button" className="button ghost" onClick={onClose}>Fermer</button>
      </header>

      <div className="wod-timer-main" aria-live="off">
        <p className="wod-timer-phase">{phase}{segment.of && !pre ? ` · ${segment.round} / ${segment.of}` : ''}</p>
        <p className="wod-timer-clock">{display}</p>
        {!pre && segment.label && segment.label !== 'Repos' && plan.segments.length > 1 && <p className="wod-timer-label">{segment.label}</p>}
        {next && status !== 'done' && <p className="wod-timer-next">Ensuite · {next.label}</p>}
        <span className="wod-timer-progress" aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /></span>
      </div>

      {plan.restPresets && status === 'idle' && (
        <div className="segmented wod-timer-presets" role="group" aria-label="Durée du repos">
          {REST_PRESETS.map((seconds) => (
            <button type="button" key={seconds} className={plan.segments[0].seconds === seconds ? 'active' : ''} aria-pressed={plan.segments[0].seconds === seconds} onClick={() => setPlan({ ...plan, segments: [{ ...plan.segments[0], seconds }] })}>{formatClock(seconds)}</button>
          ))}
        </div>
      )}

      <div className="wod-timer-controls">
        {plan.rounds && status !== 'idle' && (
          <button type="button" className="button ghost wod-timer-rounds" onClick={() => setRounds(rounds + 1)} aria-label={`Ajouter un tour, ${rounds} tours`}>
            <strong>{rounds}</strong><span>tour{rounds > 1 ? 's' : ''} · +1</span>
          </button>
        )}
        <button type="button" className="button primary wod-timer-go" onClick={toggle}>
          {status === 'running' ? 'Pause' : status === 'paused' ? 'Reprendre' : status === 'done' ? 'Recommencer' : 'Démarrer'}
        </button>
        {status !== 'idle' && <button type="button" className="button ghost" onClick={reset}>Réinitialiser</button>}
      </div>
      <p className="wod-timer-hint">Espace : démarrer / pause · Échap : fermer</p>
    </div>
  )
}
