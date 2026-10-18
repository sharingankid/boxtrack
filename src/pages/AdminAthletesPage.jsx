import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useAthletes } from '../state/AthletesContext.jsx'

const emptyForm = () => ({ first_name: '', last_name: '' })

export default function AdminAthletesPage() {
  const { session: auth } = useAuth()
  const { athletes, status, create, toggleActive, mode } = useAthletes()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  if (!auth) return <Navigate to="/login" replace />

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await create(form)
      setForm(emptyForm())
      setMessage('Athlète ajouté.')
    } catch (err) {
      setMessage(`Erreur : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const sorted = [...athletes].sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1))

  return (
    <div className="admin-shell">
      <DemoBanner />
      <AdminHeader active="athletes" />
      <main className="admin-main">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Espace coach</p>
            <h1>Athlètes</h1>
            <p>{mode === 'demo' ? 'Aperçu local non sécurisé — rien n’est envoyé au backend.' : 'Gérez la liste des membres de la box.'}</p>
          </div>
        </div>

        <section className="form-section">
          <div className="form-section-title"><span>01</span><div><p className="eyebrow">Roster</p><h2>Ajouter un athlète</h2></div></div>
          {message && <p className="save-message" role="status">{message}</p>}
          <form className="two-cols" onSubmit={submit}>
            <label>Prénom<input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label>
            <label>Nom<input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label>
            <div className="form-actions" style={{ gridColumn: '1 / -1' }}><button className="button primary" disabled={saving}>{saving ? 'Ajout…' : 'Ajouter'}</button></div>
          </form>
        </section>

        <section className="form-section">
          <div className="form-section-title"><span>02</span><div><p className="eyebrow">Membres</p><h2>Liste des athlètes</h2></div></div>
          {status === 'loading' && <p className="muted">Chargement…</p>}
          {status === 'ready' && sorted.length === 0 && <p className="muted">Aucun athlète pour le moment.</p>}
          {sorted.length > 0 && (
            <ul className="athlete-list">
              {sorted.map((athlete) => (
                <li key={athlete.id} className={athlete.active ? '' : 'inactive'}>
                  <span>{athlete.first_name} {athlete.last_name}</span>
                  <button type="button" className="button ghost small" onClick={() => toggleActive(athlete)}>
                    {athlete.active ? 'Désactiver' : 'Réactiver'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
