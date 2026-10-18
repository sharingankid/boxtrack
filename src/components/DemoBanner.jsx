import { useAuth } from '../state/AuthContext.jsx'

export default function DemoBanner({ compact = false }) {
  const { mode } = useAuth()
  if (mode !== 'demo') return null
  return <div className={`demo-banner ${compact ? 'compact' : ''}`}>Mode démonstration · données locales, aucune authentification réelle</div>
}
