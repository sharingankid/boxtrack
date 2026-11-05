import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMember } from '../state/MemberContext.jsx'
import { athleteById } from '../lib/avatars.js'
import MemberGate from '../pages/MemberGate.jsx'
import DemoBanner from './DemoBanner.jsx'
import PixelAthlete from './PixelAthlete.jsx'
import Icon from './Icon.jsx'

// The members' space opened from the TV's QR code: first the gate (guest or
// account), then today's session and, for members, history and progress.
export default function MemberLayout() {
  const { member, guest } = useMember()
  const location = useLocation()
  if (!member && !guest) return <MemberGate />
  return (
    <div className="member-shell">
      <header className="member-header">
        <Link className="brand" to="/seance">
          <span className="brand-mark">
            <Icon name="barbell" />
          </span>
          <span>
            <strong>
              BOXTRACK<span className="brand-dot">.</span>
            </strong>
            <small>CROSSFIT LAB</small>
          </span>
        </Link>
        <Link to="/moi/profil" className="member-chip">
          <PixelAthlete athlete={athleteById(member?.avatar)} compact still={!member} />
          <span>{member ? member.first_name : 'Invité'}</span>
        </Link>
      </header>
      <main className="member-main">
        <div className="route-content" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      <nav className="member-nav" aria-label="Espace adhérent">
        <NavLink to="/seance" end>
          <Icon name="bolt" />
          <span>Séance</span>
        </NavLink>
        <NavLink to="/moi/seances">
          <Icon name={member ? 'history' : 'lock'} />
          <span>Mes séances</span>
        </NavLink>
        <NavLink to="/moi/progres">
          <Icon name={member ? 'chart' : 'lock'} />
          <span>Progrès</span>
        </NavLink>
        <NavLink to="/moi/profil">
          <Icon name="user" />
          <span>Profil</span>
        </NavLink>
      </nav>
      <DemoBanner compact />
    </div>
  )
}
