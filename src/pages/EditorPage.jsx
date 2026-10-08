import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import { SESSION_FORMATS, FORMAT_LABELS, toLocalISODate } from '../lib/format.js'
import { useAuth } from '../state/AuthContext.jsx'
import { useSessions } from '../state/SessionsContext.jsx'

const blankMovement = () => ({ movement_name: '', detail: '' })
const emptyForm = () => ({
  session_date: toLocalISODate(), time_slot: '',
  warmup: { general: '', specific: '' },
  skill_strength: { kind: 'skill', instructions: '', movements: [blankMovement()] },
  wod: { format: 'AMRAP', duration_or_target: '', notes: '', movements: [blankMovement()] },
})

const formFromSession = (session) => {
  const fallback = emptyForm()
  return {
    ...fallback,
    ...session,
    warmup: { ...fallback.warmup, ...session.warmup },
    skill_strength: {
      ...fallback.skill_strength,
      ...session.skill_strength,
      movements: session.skill_strength?.movements?.length ? session.skill_strength.movements : [blankMovement()],
    },
    wod: {
      ...fallback.wod,
      ...session.wod,
      movements: session.wod?.movements?.length ? session.wod.movements : [blankMovement()],
    },
  }
}

function MovementEditor({ title, items, onChange }) {
  const update = (index, field, value) => onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  return <fieldset className="movement-editor"><legend>{title}</legend>{items.map((item, index) => <div className="movement-row" key={index}><span>{String(index + 1).padStart(2, '0')}</span><input aria-label={`Mouvement ${index + 1}`} value={item.movement_name} onChange={(e) => update(index, 'movement_name', e.target.value)} placeholder="Mouvement" /><input aria-label={`Détail ${index + 1}`} value={item.detail} onChange={(e) => update(index, 'detail', e.target.value)} placeholder="Répétitions, charge, distance…" />{items.length > 1 && <button type="button" className="icon-button" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Supprimer le mouvement ${index + 1}`}>×</button>}</div>)}<button type="button" className="add-button" onClick={() => onChange([...items, blankMovement()])}>+ Ajouter un mouvement</button></fieldset>
}

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session: auth } = useAuth()
  const { getSession, saveSession, mode } = useSessions()
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    let active = true
    if (id) getSession(id).then((item) => {
      if (active && item) setForm(formFromSession(item))
      if (active && !item) setMessage('Erreur : cette séance est introuvable.')
    }).catch((err) => {
      if (active) setMessage(`Erreur : ${err.message}`)
    })
    return () => { active = false }
  }, [id, getSession])
  if (!auth) return <Navigate to="/login" replace />
  const setBlock = (block, field, value) => setForm((current) => ({ ...current, [block]: { ...current[block], [field]: value } }))
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setMessage('')
    const clean = { ...form, skill_strength: { ...form.skill_strength, movements: form.skill_strength.movements.filter((m) => m.movement_name) }, wod: { ...form.wod, movements: form.wod.movements.filter((m) => m.movement_name) } }
    try { const saved = await saveSession(clean, id); setMessage(mode === 'demo' ? 'Séance enregistrée pour cet aperçu uniquement.' : 'Séance enregistrée.'); if (!id) navigate(`/admin/sessions/${saved.id}/edit`, { replace: true }) } catch (err) { setMessage(`Erreur : ${err.message}`) } finally { setSaving(false) }
  }
  return <div className="admin-shell"><DemoBanner /><AdminHeader active="sessions" /><main className="admin-main"><div className="admin-title"><div><p className="eyebrow">Espace coach</p><h1>{id ? 'Modifier la séance' : 'Créer une séance'}</h1><p>{mode === 'demo' ? 'Aperçu local non sécurisé — rien n’est envoyé au backend.' : 'Les changements seront publiés via l’API BoxTrack.'}</p></div><button form="session-form" className="button primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>{message && <p className="save-message" role="status">{message}</p>}<form id="session-form" className="editor-form" onSubmit={submit}><section className="form-section"><div className="form-section-title"><span>01</span><div><p className="eyebrow">Planification</p><h2>Date & créneau</h2></div></div><div className="two-cols"><label>Date<input type="date" required value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} /></label><label>Créneau<input required value={form.time_slot} onChange={(e) => setForm({ ...form, time_slot: e.target.value })} placeholder="18:00" /><small>Libellé libre convenu avec l’API</small></label></div></section><section className="form-section"><div className="form-section-title"><span>02</span><div><p className="eyebrow">Mise en route</p><h2>Warm-Up</h2></div></div><label>Échauffement général<textarea rows="3" value={form.warmup.general} onChange={(e) => setBlock('warmup', 'general', e.target.value)} placeholder="Cardio, mobilité générale…" /></label><label>Échauffement spécifique<textarea rows="3" value={form.warmup.specific} onChange={(e) => setBlock('warmup', 'specific', e.target.value)} placeholder="Préparation des mouvements du jour…" /></label></section><section className="form-section"><div className="form-section-title"><span>03</span><div><p className="eyebrow">Technique & force</p><h2>Skill / Strength</h2></div></div><div className="segmented"><button type="button" className={form.skill_strength.kind === 'skill' ? 'active' : ''} onClick={() => setBlock('skill_strength', 'kind', 'skill')}>Skill</button><button type="button" className={form.skill_strength.kind === 'strength' ? 'active' : ''} onClick={() => setBlock('skill_strength', 'kind', 'strength')}>Strength</button></div><label>Consignes<textarea rows="3" value={form.skill_strength.instructions} onChange={(e) => setBlock('skill_strength', 'instructions', e.target.value)} /></label><MovementEditor title="Mouvements" items={form.skill_strength.movements} onChange={(value) => setBlock('skill_strength', 'movements', value)} /></section><section className="form-section accent-section"><div className="form-section-title"><span>04</span><div><p className="eyebrow">Workout of the day</p><h2>WOD</h2></div></div><fieldset><legend>Format</legend><div className="format-picker">{SESSION_FORMATS.map((format) => <button type="button" key={format} className={form.wod.format === format ? 'active' : ''} onClick={() => setBlock('wod', 'format', format)}>{FORMAT_LABELS[format]}</button>)}</div></fieldset><label>Durée ou objectif<input value={form.wod.duration_or_target} onChange={(e) => setBlock('wod', 'duration_or_target', e.target.value)} placeholder="20 min, 21-15-9, cap 15 min…" /></label><MovementEditor title="Mouvements" items={form.wod.movements} onChange={(value) => setBlock('wod', 'movements', value)} /><label>Notes du coach<textarea rows="3" value={form.wod.notes} onChange={(e) => setBlock('wod', 'notes', e.target.value)} placeholder="Intention, pacing, adaptations…" /></label></section><div className="form-actions"><button className="button primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer la séance'}</button><Link className="button ghost" to="/">Annuler</Link></div></form></main></div>
}
