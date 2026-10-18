import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import QrCodeImage from '../components/QrCodeImage.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useQrCodes } from '../state/QrCodesContext.jsx'

const emptyForm = () => ({ label: '', url: '' })

export default function AdminQrCodesPage() {
  const { session: auth } = useAuth()
  const { qrCodes, status, create, remove, mode } = useQrCodes()
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
      setMessage('QR code ajouté.')
    } catch (err) {
      setMessage(`Erreur : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-shell">
      <DemoBanner />
      <AdminHeader active="qrcodes" />
      <main className="admin-main">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Espace coach</p>
            <h1>QR Codes</h1>
            <p>{mode === 'demo' ? 'Aperçu local non sécurisé — rien n’est envoyé au backend.' : 'Avis Google, Instagram, inscription à un événement…'}</p>
          </div>
        </div>

        <section className="form-section">
          <div className="form-section-title"><span>01</span><div><p className="eyebrow">Configurer</p><h2>Ajouter un QR code</h2></div></div>
          {message && <p className="save-message" role="status">{message}</p>}
          <form className="two-cols" onSubmit={submit}>
            <label>Libellé<input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Avis Google" /></label>
            <label>Destination (URL)<input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></label>
            <div className="form-actions" style={{ gridColumn: '1 / -1' }}><button className="button primary" disabled={saving}>{saving ? 'Ajout…' : 'Ajouter'}</button></div>
          </form>
        </section>

        <section className="form-section">
          <div className="form-section-title"><span>02</span><div><p className="eyebrow">Publiés</p><h2>QR codes actifs</h2></div></div>
          {status === 'loading' && <p className="muted">Chargement…</p>}
          {status === 'ready' && qrCodes.length === 0 && <p className="muted">Aucun QR code pour le moment.</p>}
          {qrCodes.length > 0 && (
            <div className="qr-grid compact">
              {qrCodes.map((qr) => (
                <div className="qr-card" key={qr.id}>
                  <QrCodeImage url={qr.url} size={140} />
                  <span>{qr.label}</span>
                  <button type="button" className="icon-button" onClick={() => remove(qr.id)} aria-label={`Supprimer ${qr.label}`}>×</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
