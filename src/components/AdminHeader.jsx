import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function AdminHeader({ active }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <header className="admin-header">
      <Link className="brand" to="/"><span className="brand-mark">BT</span><span><strong>BOXTRACK</strong><small>COACH</small></span></Link>
      <nav className="admin-nav" aria-label="Navigation coach">
        <Link className={active === 'sessions' ? 'active' : ''} to="/admin/sessions/new">Séances</Link>
        <Link className={active === 'recipes' ? 'active' : ''} to="/admin/recipes">Recettes</Link>
      </nav>
      <div>
        <Link className="text-link" to="/">Voir le site</Link>
        <button className="button ghost small" onClick={async () => { await logout(); navigate('/') }}>Déconnexion</button>
      </div>
    </header>
  )
}
