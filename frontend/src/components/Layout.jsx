import { NavLink, Outlet } from 'react-router-dom'
import DemoBanner from './DemoBanner.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function Layout() {
  return (
    <div className="app-shell">
      <DemoBanner />
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="BoxTrack, accueil">
          <span className="brand-mark">BT</span>
          <span><strong>BOXTRACK</strong><small>CROSSFIT LAB</small></span>
        </NavLink>
        <div className="header-actions">
          <nav aria-label="Navigation principale">
            <NavLink to="/">Aujourd’hui</NavLink>
            <NavLink to="/history">Historique</NavLink>
            <NavLink to="/login">Espace coach</NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main><Outlet /></main>
      <footer><span>BoxTrack · proposition front-end</span><span>CrossFit LAB — Toulouse</span></footer>
    </div>
  )
}
