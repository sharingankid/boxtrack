import { useState } from 'react'
import { useMember } from '../state/MemberContext.jsx'
import { ATHLETES } from '../data/athletes.js'
import { formatDate } from '../lib/format.js'
import { parisNow } from '../lib/schedule.js'
import PixelAthlete from '../components/PixelAthlete.jsx'
import Icon from '../components/Icon.jsx'
import DemoBanner from '../components/DemoBanner.jsx'

// First screen after scanning the TV: guest, sign in, or create an account.
export default function MemberGate() {
  const { enterAsGuest, login, register } = useMember()
  const [view, setView] = useState('choice')
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', avatar: 'manA' })
  const [state, setState] = useState({ busy: false, error: '' })
  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
  })
  const submit = async (event) => {
    event.preventDefault()
    setState({ busy: true, error: '' })
    try {
      if (view === 'login') await login({ email: form.email, password: form.password })
      else await register(form)
    } catch (err) {
      setState({ busy: false, error: err.message })
    }
  }
  const back = () => {
    setView('choice')
    setState({ busy: false, error: '' })
  }

  return (
    <div className="member-gate">
      <section className="gate-hero">
        <p className="eyebrow">CROSSFIT LAB · {formatDate(parisNow().date)}</p>
        <h1>
          PRÊT POUR
          <br />
          <span>LA SÉANCE ?</span>
        </h1>
        <div className="gate-track" aria-hidden="true">
          {ATHLETES.map((athlete, index) => (
            <PixelAthlete
              key={athlete.id}
              athlete={athlete}
              move={['jack', 'run', 'squat', 'jump'][index]}
              phase={index}
            />
          ))}
        </div>
      </section>

      {view === 'choice' && (
        <div className="gate-choices">
          <button className="gate-choice is-primary" onClick={() => setView('register')}>
            <Icon name="user" />
            <b>Créer mon compte</b>
            <small>Tes séances, tes scores, ta progression et le classement.</small>
          </button>
          <button className="gate-choice" onClick={() => setView('login')}>
            <Icon name="lock" />
            <b>J’ai déjà un compte</b>
            <small>Connexion avec ton email.</small>
          </button>
          <button className="gate-choice is-ghost" onClick={enterAsGuest}>
            <Icon name="arrow" />
            <b>Continuer en invité</b>
            <small>La séance du jour seulement, sans historique ni score.</small>
          </button>
        </div>
      )}

      {view !== 'choice' && (
        <form className="gate-form" onSubmit={submit}>
          <h2>{view === 'login' ? 'Connexion' : 'Créer mon compte'}</h2>
          {view === 'register' && (
            <>
              <div className="gate-row">
                <label>
                  Prénom
                  <input required maxLength={60} autoComplete="given-name" {...field('first_name')} />
                </label>
                <label>
                  Nom
                  <input required maxLength={60} autoComplete="family-name" {...field('last_name')} />
                </label>
              </div>
            </>
          )}
          <label>
            Email
            <input type="email" required autoComplete="email" {...field('email')} />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              required
              minLength={view === 'register' ? 8 : undefined}
              autoComplete={view === 'login' ? 'current-password' : 'new-password'}
              placeholder={view === 'register' ? '8 caractères minimum' : ''}
              {...field('password')}
            />
          </label>
          {view === 'register' && (
            <div className="athlete-picker" role="group" aria-label="Choisis ton athlète">
              <p className="eyebrow">TON ATHLÈTE</p>
              <div>
                {ATHLETES.map((athlete, index) => (
                  <button
                    type="button"
                    key={athlete.id}
                    aria-pressed={form.avatar === athlete.id}
                    aria-label={athlete.label}
                    onClick={() => setForm({ ...form, avatar: athlete.id })}
                  >
                    <PixelAthlete
                      athlete={athlete}
                      compact
                      move={form.avatar === athlete.id ? 'jack' : 'idle'}
                      still={form.avatar !== athlete.id}
                      phase={index}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          {state.error && (
            <p className="form-error" role="alert">
              {state.error}
            </p>
          )}
          <button className="button primary wide" disabled={state.busy}>
            {state.busy ? 'Un instant…' : view === 'login' ? 'Me connecter' : 'Créer mon compte'}
            <Icon name="arrow" />
          </button>
          {view === 'register' && (
            <p className="gate-note">
              Ton nom apparaît dans le classement de la box. Ton email sert seulement à te
              connecter.
            </p>
          )}
          <button type="button" className="text-button gate-back" onClick={back}>
            ← Retour
          </button>
        </form>
      )}
      <DemoBanner compact />
    </div>
  )
}
