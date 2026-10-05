import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import DemoBanner from '../components/DemoBanner.jsx'
import { useAuth } from '../state/AuthContext.jsx'

export default function LoginPage() {
  const { session, login, mode } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  if (session) return <Navigate to="/admin/sessions/new" replace />
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try { await login(form); navigate('/admin/sessions/new') } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  return (
    <section className="login-page">
      <div className="login-panel"><div className="brand large"><span className="brand-mark">BT</span><span><strong>BOXTRACK</strong><small>CROSSFIT LAB</small></span></div><p className="eyebrow">Espace réservé</p><h1>Bienvenue,<br /><em>coach.</em></h1><p>Créez et mettez à jour les séances visibles par toute la communauté.</p></div>
      <div className="login-form-wrap"><DemoBanner /><form className="login-form" onSubmit={submit}><p className="eyebrow">Connexion</p><h2>Accéder à l’éditeur</h2>{mode === 'demo' && <p className="notice">Aucun contrôle d’identité n’est effectué ici. Ce bouton ouvre seulement l’aperçu de l’éditeur local.</p>}{error && <p className="form-error" role="alert">{error}</p>}<label>Email<input type="email" required autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="coach@crossfitlab.fr" /></label><label>Mot de passe<input type="password" required={mode === 'api'} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••••••" /></label><button className="button primary wide" disabled={loading}>{loading ? 'Connexion…' : mode === 'demo' ? 'Prévisualiser l’éditeur' : 'Se connecter'}</button></form></div>
    </section>
  )
}
