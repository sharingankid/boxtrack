import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import DemoBanner from '../components/DemoBanner.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { useAuth } from '../state/AuthContext.jsx'

export default function LoginPage() {
  const { session, login, mode, reason } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = location.state?.from?.startsWith('/admin/') && !location.state.from.endsWith('/logout') ? location.state.from : '/admin'
  const [form, setForm] = useState({ email: '', password: '', role: 'coach' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  if (session) return <Navigate to={destination} replace />
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try { await login(form); navigate(destination, { replace: true }) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  return (
    <section className="login-page">
      <ThemeToggle className="login-theme-toggle" />
      <div className="login-panel"><div className="brand large"><span className="brand-mark">BT</span><span><strong>BOXTRACK</strong><small>CROSSFIT LAB</small></span></div><p className="eyebrow">Espace réservé</p><h1>Espace coach</h1><p>Publiez et modifiez les entraînements de la box.</p></div>
      <div className="login-form-wrap"><DemoBanner /><form className="login-form" onSubmit={submit}><p className="eyebrow">Connexion</p><h2>Accéder au planning</h2>{mode === 'demo' && <p className="notice">Démonstration locale : aucune authentification réelle. Les séances restent dans ce navigateur.</p>}{reason && <p className="notice" role="status">{reason}</p>}{error && <p className="form-error" role="alert">{error}</p>}<label>Email<input type="email" required autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="coach@crossfitlab.fr" /></label>{mode === 'demo' && <label>Profil de démonstration<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="coach">Coach</option><option value="staff">Staff autorisé</option></select></label>}<label>Mot de passe<input type="password" required={mode === 'api'} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••••••" /></label><button className="button primary wide" disabled={loading}>{loading ? 'Connexion…' : mode === 'demo' ? 'Ouvrir la démonstration' : 'Se connecter'}</button></form></div>
    </section>
  )
}
