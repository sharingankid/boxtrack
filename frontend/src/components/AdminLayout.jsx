import { useEffect } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import DemoBanner from './DemoBanner.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function AdminLayout() {
  const { session } = useAuth()
  const location = useLocation()
  if (!session || session.expiresAt <= Date.now()) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <div className="coach-shell"><DemoBanner /><header className="coach-header"><Link className="brand" to="/admin"><span className="brand-mark">BT</span><span><strong>BOXTRACK</strong><small>CROSSFIT LAB · COACH</small></span></Link><div><ThemeToggle /><Link className="text-link" to="/admin/logout">Déconnexion</Link></div></header><main className="coach-main"><Outlet /></main><nav className="coach-nav" aria-label="Navigation coach"><NavLink to="/admin" end>Planning</NavLink><NavLink to="/admin/sessions/new">Créer une séance</NavLink><NavLink to="/admin/history">Historique</NavLink><Link to="/screen">Vue TV</Link></nav></div>
}
export function LogoutPage() {
  const { logout } = useAuth()
  useEffect(() => { logout() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return <p role="status">Déconnexion…</p>
}
