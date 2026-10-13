import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import DemoBanner from '../components/DemoBanner.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { FORMAT_LABELS, formatDate, toLocalISODate } from '../lib/format.js'
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
  return <ol className="tv-movements">{items.map((item, index) => <li key={`${item.movement_name}-${index}`}><b>{item.movement_name}</b><small>{item.detail}</small></li>)}</ol>
}

export default function ScreenPage() {
  const { sessions, status, error, refresh, mode } = useSessions()
  const [today, setToday] = useState(toLocalISODate)
  useEffect(() => {
    const timer = setInterval(() => {
      setToday(toLocalISODate())
      if (mode === 'api') refresh({ silent: true })
    }, 30000)
    return () => clearInterval(timer)
  }, [mode, refresh])
  const session = useMemo(() => sessions.filter((item) => item.session_date === today)
    .sort((a, b) => a.time_slot.localeCompare(b.time_slot))[0], [sessions, today])
  if (status === 'loading') return <main className="tv-state"><StatePanel title="Chargement du programme" message="Un instant…" /></main>
  if (status === 'error') return <main className="tv-state"><StatePanel type="error" title="Programme indisponible" message={`${error} Nouvelle tentative automatique dans 30 secondes.`} /></main>
  if (!session) return <main className="tv-state"><StatePanel type="empty" title="Aucune séance aujourd’hui" message="Le programme s’affichera après sa publication." /></main>
  return (
    <main className="tv-screen">
      <header>
        <div className="brand"><span className="brand-mark">BT</span><span><strong>BOXTRACK</strong><small>CROSSFIT LAB</small></span></div>
        <div className="tv-date"><span>{formatDate(session.session_date)}</span><strong>{session.time_slot}</strong></div>
      </header>
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
      <footer><span>CrossFit LAB · Toulouse</span><DemoBanner compact /></footer>
    </main>
  )
}
