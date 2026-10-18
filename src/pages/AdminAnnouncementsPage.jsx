import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useAnnouncements } from '../state/AnnouncementsContext.jsx'

const emptyForm = () => ({ title: '', body: '' })

export default function AdminAnnouncementsPage() {
  const { session: auth } = useAuth()
  const { announcements, status, create, update, remove, mode } = useAnnouncements()
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
      setMessage('Annonce publiée.')
    } catch (err) {
      setMessage(`Erreur : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-shell">
      <DemoBanner />
      <AdminHeader active="announcements" />
      <main className="admin-main">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Espace coach</p>
            <h1>Annonces</h1>
            <p>{mode === 'demo' ? 'Aperçu local non sécurisé — rien n’est envoyé au backend.' : 'Publiez une information pour les membres.'}</p>
          </div>
        </div>

        <section className="form-section">
          <div className="form-section-title"><span>01</span><div><p className="eyebrow">Publier</p><h2>Nouvelle annonce</h2></div></div>
          {message && <p className="save-message" role="status">{message}</p>}
          <form className="editor-form" onSubmit={submit}>
            <label>Titre<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Open Day samedi 14 novembre" /></label>
            <label>Détails (optionnel)<textarea rows="3" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
            <div className="form-actions"><button className="button primary" disabled={saving}>{saving ? 'Publication…' : 'Publier'}</button></div>
          </form>
        </section>

        <section className="form-section">
          <div className="form-section-title"><span>02</span><div><p className="eyebrow">Historique</p><h2>Annonces</h2></div></div>
          {status === 'loading' && <p className="muted">Chargement…</p>}
          {status === 'ready' && announcements.length === 0 && <p className="muted">Aucune annonce pour le moment.</p>}
          {announcements.length > 0 && (
            <ul className="athlete-list">
              {announcements.map((announcement) => (
                <li key={announcement.id} className={announcement.active ? '' : 'inactive'}>
                  <span>{announcement.title}</span>
                  <div>
                    <button type="button" className="button ghost small" onClick={() => update(announcement.id, { active: !announcement.active })}>
                      {announcement.active ? 'Masquer' : 'Republier'}
                    </button>
                    <button type="button" className="icon-button" onClick={() => remove(announcement.id)} aria-label={`Supprimer ${announcement.title}`}>×</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
