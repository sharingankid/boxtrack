import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import Icon from '../components/Icon.jsx'
export default function LoginPage() {
  const { session, login, mode, reason } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const destination = /^\/coach(?:\/|$)/.test(location.state?.from || '')
    ? location.state.from
    : '/coach'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (session) return <Navigate to={destination} replace />
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login({ email, password })
      navigate(destination, { replace: true })
    } catch (err) {
      setError(
        err.status === 401 ? 'Email ou mot de passe incorrect.' : err.message,
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="barbell" />
          </span>
          <span>
            <strong>
              BOXTRACK<span className="brand-dot">.</span>
            </strong>
            <small>LA PROGRAMMATION CROSSFIT</small>
          </span>
        </div>
        <div className="login-art">
          <p className="eyebrow">CROSSFIT LAB / COACH & STAFF</p>
          <h1>
            PRÉPAREZ
            <br />
            LA PROCHAINE
            <br />
            <span>SÉANCE.</span>
          </h1>
          <p>De votre programmation à l’écran de la salle.</p>
          <div className="training-track" aria-hidden="true">
            <span>WARM-UP</span>
            <i />
            <span>STRENGTH</span>
            <i />
            <span>WOD</span>
          </div>
        </div>
        <div className="login-signature">
          <span>CROSSFIT LAB</span>
          <span>
            PROGRAMMER
            <br />
            TRANSMETTRE
          </span>
        </div>
        <svg
          className="login-barbell"
          viewBox="0 0 420 200"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 100h420M55 30v140M85 10v180M335 10v180M365 30v140"
            stroke="currentColor"
            strokeWidth="16"
          />
          <path d="M0 180h420M0 20h420" stroke="currentColor" />
        </svg>
      </section>
      <section className="login-form-wrap">
        <DemoBanner />
        <form onSubmit={submit} className="login-form">
          <div className="login-access">
            <Icon name="lock" />
            <span>ACCÈS À VOTRE BOX</span>
          </div>
          <h2>
            Prêt pour <br />
            la séance ?
          </h2>
          <p className="muted">Connectez-vous à votre espace coach.</p>
          {reason && (
            <p className="notice" role="status">
              {reason}
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <fieldset disabled={busy}>
            <label>
              Email
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@crossfitlab.fr"
              />
            </label>
            <label htmlFor="password">Mot de passe</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required={mode === 'api'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                aria-label={
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name="eye" />
              </button>
            </div>
            <button className="button primary wide" aria-busy={busy}>
              {busy ? (
                <>
                  <span className="loading-spinner" />
                  Connexion…
                </>
              ) : (
                <>
                  {mode === 'demo' ? 'Ouvrir la démonstration' : 'Se connecter'}
                  <Icon name="arrow" />
                </>
              )}
            </button>
          </fieldset>
          <p className="login-session-note">
            <Icon name="lock" />
            Votre session reste ouverte pendant 7 jours sur cet appareil.
          </p>
        </form>
        <p className="login-form-footer">
          BOXTRACK <span>/</span> CROSSFIT LAB
        </p>
      </section>
    </main>
  )
}
