import { useMember } from '../state/MemberContext.jsx'
import { athleteById } from '../lib/avatars.js'
import { ATHLETES } from '../data/athletes.js'
import PixelAthlete from '../components/PixelAthlete.jsx'
import Icon from '../components/Icon.jsx'

export default function MemberProfilePage() {
  const { member, guest, logout, leaveGuest } = useMember()
  if (guest)
    return (
      <section className="member-locked">
        <div className="gate-track" aria-hidden="true">
          {ATHLETES.map((athlete, index) => (
            <PixelAthlete key={athlete.id} athlete={athlete} move="idle" phase={index} compact />
          ))}
        </div>
        <p className="eyebrow">MODE INVITÉ</p>
        <h2>Tu t’entraînes en invité</h2>
        <p>Rien n’est gardé après ta visite. Crée ton compte pour garder tes séances et entrer dans le classement.</p>
        <button className="button primary wide" onClick={leaveGuest}>
          <Icon name="user" />
          Créer mon compte ou me connecter
        </button>
      </section>
    )
  return (
    <section className="member-profile">
      <PixelAthlete athlete={athleteById(member.avatar)} move="jack" />
      <p className="eyebrow">MON PROFIL</p>
      <h1>
        {member.first_name} {member.last_name}
      </h1>
      <p className="muted">{member.email}</p>
      <p className="muted">Athlète : {athleteById(member.avatar).label}</p>
      <button className="button ghost wide" onClick={logout}>
        <Icon name="logout" />
        Me déconnecter
      </button>
    </section>
  )
}
