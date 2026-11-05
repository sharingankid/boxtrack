import { useMember } from '../state/MemberContext.jsx'
import { ATHLETES } from '../data/athletes.js'
import PixelAthlete from './PixelAthlete.jsx'
import Icon from './Icon.jsx'

// What a guest sees in place of the member-only pages.
export default function MemberLocked({ title, children }) {
  const { leaveGuest } = useMember()
  return (
    <section className="member-locked">
      <div className="locked-scene" aria-hidden="true">
        <PixelAthlete athlete={ATHLETES[3]} move="pullup" />
        <span className="locked-badge">
          <Icon name="lock" />
        </span>
      </div>
      <p className="eyebrow">RÉSERVÉ AUX MEMBRES</p>
      <h2>{title}</h2>
      <p>{children}</p>
      <button className="button primary wide" onClick={leaveGuest}>
        <Icon name="user" />
        Créer mon compte ou me connecter
      </button>
    </section>
  )
}
