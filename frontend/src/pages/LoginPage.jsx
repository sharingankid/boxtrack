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
          viewBox="0 0 560 260"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="login-barbell-steel"
              x1="0"
              y1="50"
              x2="0"
              y2="210"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8a928e" />
              <stop offset=".48" stopColor="#3e4743" />
              <stop offset="1" stopColor="#171e1a" />
            </linearGradient>
            <linearGradient
              id="login-barbell-grip"
              x1="170"
              y1="120"
              x2="390"
              y2="140"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#707b73" />
              <stop offset=".5" stopColor="#b7bdb8" />
              <stop offset="1" stopColor="#707b73" />
            </linearGradient>
          </defs>
          <circle
            className="login-barbell-orbit"
            cx="280"
            cy="130"
            r="110"
            stroke="#ff792f"
            strokeOpacity=".2"
            strokeDasharray="2 12"
          />
          <path d="M24 122h512v16H24z" fill="url(#login-barbell-grip)" />
          <path d="M180 122h200v16H180z" fill="#171e1a" />
          <path
            d="M188 125h184M188 130h184M188 135h184"
            stroke="#9aa49c"
            strokeWidth="1.5"
            strokeDasharray="2 5"
          />
          <g fill="url(#login-barbell-steel)" stroke="#a6b1a8" strokeWidth="2">
            <rect x="55" y="76" width="30" height="108" rx="6" />
            <rect x="88" y="47" width="38" height="166" rx="7" />
            <rect x="129" y="26" width="44" height="208" rx="8" />
            <rect x="387" y="26" width="44" height="208" rx="8" />
            <rect x="434" y="47" width="38" height="166" rx="7" />
            <rect x="475" y="76" width="30" height="108" rx="6" />
          </g>
          <path d="M140 40v180M420 40v180" stroke="#ff792f" strokeWidth="4" />
          <path d="M34 116h12v28H34zM514 116h12v28h-12z" fill="#ff792f" />
          <path
            className="login-barbell-shine"
            d="M136 38h29v182M395 38h29v182"
            stroke="#e4e8e4"
            strokeWidth="2"
            strokeDasharray="30 230"
          />
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
