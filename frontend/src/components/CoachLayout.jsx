import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import DemoBanner from './DemoBanner.jsx'
import Icon from './Icon.jsx'
export default function CoachLayout() {
  const { session, logout } = useAuth()
  const location = useLocation()
  const requestLogout = () => {
    const event = new CustomEvent('boxtrack:logout-request', {
      cancelable: true,
    })
    if (window.dispatchEvent(event)) logout()
  }
  if (!session || session.expiresAt <= Date.now())
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  return (
    <div className="coach-shell">
      <DemoBanner />
      <header className="coach-header">
        <Link className="brand" to="/coach">
          <span className="brand-mark">
            <Icon name="barbell" />
          </span>
          <span>
            <strong>
              BOXTRACK<span className="brand-dot">.</span>
            </strong>
            <small>CROSSFIT LAB / COACH & STAFF</small>
          </span>
        </Link>
        <div className="coach-account">
          <span className="account-role">
            <i />
            Espace {session.user.role === 'staff' ? 'staff' : 'coach'}
          </span>
          <button className="text-button logout-button" onClick={requestLogout}>
            <Icon name="logout" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>
      <main className="coach-main">
        <div className="route-content" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      <nav className="coach-nav" aria-label="Navigation coach">
        <span className="nav-caption">VOTRE BOX</span>
        <NavLink to="/coach" end>
          <Icon name="calendar" />
          <span>Planning</span>
        </NavLink>
        <NavLink className="nav-create" to="/coach/sessions/new">
          <Icon name="plus" />
          <span>Créer une séance</span>
        </NavLink>
        <NavLink to="/coach/sessions" end>
          <Icon name="history" />
          <span>Séances passées</span>
        </NavLink>
        <Link to="/screen" target="_blank" rel="noreferrer">
          <Icon name="screen" />
          <span>Vue TV ↗</span>
        </Link>
        <p className="nav-footer">
          CROSSFIT LAB
          <br />
          <span>La programmation de votre salle.</span>
        </p>
      </nav>
    </div>
  )
}
