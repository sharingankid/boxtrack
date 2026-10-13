import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

const TABS = [
  { key: 'sessions', label: 'Séances', to: '/admin/sessions/new' },
  { key: 'athletes', label: 'Athlètes', to: '/admin/athletes' },
  { key: 'recipes', label: 'Recettes', to: '/admin/recipes' },
  { key: 'announcements', label: 'Annonces', to: '/admin/announcements' },
  { key: 'qrcodes', label: 'QR Codes', to: '/admin/qrcodes' },
]

export default function AdminHeader({ active }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <header className="admin-header">
      <Link className="brand" to="/"><span className="brand-mark">BT</span><span><strong>BOXTRACK</strong><small>COACH</small></span></Link>
      <nav className="admin-nav" aria-label="Navigation coach">
        {TABS.map((tab) => <Link key={tab.key} className={active === tab.key ? 'active' : ''} to={tab.to}>{tab.label}</Link>)}
      </nav>
      <div>
        <Link className="text-link" to="/">Voir le site</Link>
        <button className="button ghost small" onClick={async () => { await logout(); navigate('/') }}>Déconnexion</button>
      </div>
    </header>
  )
}
