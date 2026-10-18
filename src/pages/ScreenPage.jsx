import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import DemoBanner from '../components/DemoBanner.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { FORMAT_LABELS, formatDate, toLocalISODate } from '../lib/format.js'
import { useSessions } from '../state/SessionsContext.jsx'

export default function ScreenPage() {
  const { sessions, status, error, refresh } = useSessions()
  const today = toLocalISODate()
  const session = useMemo(() => sessions.filter((item) => item.session_date === today).sort((a, b) => a.time_slot.localeCompare(b.time_slot))[0], [sessions, today])
  if (status === 'loading') return <div className="tv-state"><StatePanel title="Chargement du WOD" message="BoxTrack prépare l’écran…" /></div>
  if (status === 'error') return <div className="tv-state"><StatePanel type="error" title="WOD indisponible" message={error} action={<button className="button primary" onClick={refresh}>Réessayer</button>} /></div>
  if (!session) return <div className="tv-state"><StatePanel type="empty" title="Aucune séance aujourd’hui" message="L’écran se mettra à jour à la prochaine publication." /><Link to="/" className="sr-only">Retour</Link></div>
  return <main className="tv-screen"><DemoBanner compact /><header><div className="brand light"><span className="brand-mark">BT</span><span><strong>BOXTRACK</strong><small>CROSSFIT LAB</small></span></div><div className="tv-date"><span>{formatDate(session.session_date)}</span><strong>{session.time_slot}</strong></div></header><section className="tv-content"><div className="tv-phase"><p>Warm-Up</p><h2>{session.warmup?.general}</h2><small>{session.warmup?.specific}</small></div><div className="tv-phase"><p>{session.skill_strength?.kind === 'strength' ? 'Strength' : 'Skill'}</p><h2>{session.skill_strength?.movements?.[0]?.movement_name || 'Technique'}</h2><small>{session.skill_strength?.movements?.[0]?.detail || session.skill_strength?.instructions}</small></div><div className="tv-wod"><div><p>Workout of the day</p><h1>{FORMAT_LABELS[session.wod?.format]}</h1><strong>{session.wod?.duration_or_target}</strong></div><ol>{session.wod?.movements?.map((movement, index) => <li key={`${movement.movement_name}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><b>{movement.movement_name}</b><small>{movement.detail}</small></li>)}</ol></div></section><footer><span>{session.wod?.notes || 'Move well. Stay strong.'}</span><span>crossfitlab.fr</span></footer></main>
}
