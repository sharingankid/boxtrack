import { apiClient } from '../services/apiClient.js'
import useClock from '../hooks/useClock.js'
import { selectSchedule, slotLabel } from '../lib/schedule.js'
import { movementDetail } from '../services/sessionAdapter.js'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import DemoBanner from '../components/DemoBanner.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { FORMAT_LABELS, formatDate } from '../lib/format.js'
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
      let size = window.innerWidth * .02
      content.style.fontSize = `${size}px`
      for (let pass = 0; pass < 30 && (content.scrollHeight > area.clientHeight || content.scrollWidth > area.clientWidth); pass += 1) {
        size *= .9
        content.style.fontSize = `${size}px`
      }
    }
    const observer = new ResizeObserver(fit)
    observer.observe(area)
    document.fonts.ready.then(fit)
    fit()
    return () => { active = false; observer.disconnect() }
  }, [children])
  return <div className="tv-fit-area" ref={areaRef}><div className="tv-fit-content" ref={contentRef}>{children}</div></div>
}

function Movements({ items = [] }) {
  return <ol className="tv-movements">{items.map((item, index) => <li key={`${item.movement_name}-${index}`}><b>{item.movement_name}</b><small>{movementDetail(item)}</small></li>)}</ol>
}

export default function ScreenPage() {
  const { sessions, status: listStatus, error: listError, refresh, mode } = useSessions()
  const [tv, setTv] = useState({ data: null, error: '', loaded: false })
  const now = useClock()
  useEffect(() => {
    const timer = setInterval(() => refresh({ silent: true }), 30000)
    return () => clearInterval(timer)
  }, [refresh])
  useEffect(() => {
    if (mode !== 'api') return
    let active = true
    const update = async () => {
      try { const data = await apiClient.tvNow(); if (active) setTv({ data, error: '', loaded: true }) }
      catch { if (active) setTv(previous => ({ ...previous, loaded: true, error: 'Connexion indisponible.' })) }
    }
    update()
    const timer = setInterval(update, 30000)
    return () => { active = false; clearInterval(timer) }
  }, [mode, now.date, now.time])
  const schedule = selectSchedule(sessions, now)
  const session = mode === 'api' ? tv.data?.current || tv.data?.next : schedule.display
  const current = mode === 'api' ? tv.data?.current : schedule.current
  const incomplete = mode === 'api' ? false : schedule.incomplete
  const error = mode === 'api' ? tv.error : listError
  const status = mode === 'api' ? !tv.loaded ? 'loading' : tv.error ? 'error' : 'ready' : listStatus
  if (status === 'loading') return <main className="tv-state"><div className="tv-state-clock">{formatDate(now.date)} · {now.time}</div><StatePanel title="Chargement du programme" message="Un instant…" /></main>
  if (status === 'error' && (mode === 'api' ? !tv.data : !sessions.length)) return <main className="tv-state"><div className="tv-state-clock">{formatDate(now.date)} · {now.time}</div><StatePanel type="error" title="Programme indisponible" message={`${error} Nouvelle tentative automatique dans 30 secondes.`} /></main>
  if (!session) return <main className="tv-state"><div className="tv-state-clock">{formatDate(now.date)} · {now.time}</div><StatePanel type="empty" title={incomplete ? "Horaires à confirmer" : "Aucune séance à venir"} message={incomplete ? "L’heure de fin manque dans le planning. Le coach doit compléter les horaires." : "Le programme s’affichera à la prochaine séance."} /></main>
  return (
    <main className={`tv-screen ${session.title ? 'with-title' : ''}`}>
      <header>
        <div className="brand"><span className="brand-mark">BT</span><span><strong>BOXTRACK</strong><small>CROSSFIT LAB</small></span></div>
        <div className="tv-date"><span>{formatDate(now.date)}<br />{current ? 'En cours' : 'Prochaine séance'} · {slotLabel(session)}</span><strong aria-label="Heure actuelle">{now.time}</strong></div>
      </header>
      {session.title && <h1 className="tv-session-title">{session.title}</h1>}
      <section className="tv-content" aria-label="Programme de la séance">
        <section className="tv-phase">
          <h2>Warm-Up</h2>
          <FitContent><h3>Général</h3><p>{session.warmup?.general || 'Non renseigné'}</p><h3>Spécifique</h3><p>{session.warmup?.specific || 'Non renseigné'}</p></FitContent>
        </section>
        <section className="tv-phase">
          <h2>{session.skill_strength?.kind === 'strength' ? 'Strength' : 'Skill'}</h2>
          <FitContent><p>{session.skill_strength?.instructions || (session.skill_strength ? '' : 'Non renseigné')}</p><Movements items={session.skill_strength?.movements} /></FitContent>
        </section>
        <section className="tv-wod">
          <h2>{FORMAT_LABELS[session.wod?.format] || 'WOD'}</h2>
          <FitContent><p className="tv-target">{session.wod?.duration_or_target}</p><Movements items={session.wod?.movements} />{session.wod?.notes && <p className="tv-notes">{session.wod.notes}</p>}</FitContent>
        </section>
      </section>
      <footer><span>{error ? 'Hors connexion · dernières données reçues · nouvelle tentative automatique' : 'CrossFit LAB · Toulouse'}</span><DemoBanner compact /></footer>
    </main>
  )
}
