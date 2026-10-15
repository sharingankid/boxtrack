import { useEffect, useRef, useState } from 'react'
import { Link, useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom'
import { FORMAT_LABELS, SESSION_FORMATS } from '../lib/format.js'
import { addDays, minutes, parisNow } from '../lib/schedule.js'
import { useAuth } from '../state/AuthContext.jsx'
import { useSessions } from '../state/SessionsContext.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import StatePanel from '../components/StatePanel.jsx'

const blankMovement = () => ({ movement_name: '', sets_reps: '', load: '', instructions: '', detail: '' })
const isBlank = movement => !['movement_name', 'sets_reps', 'load', 'instructions', 'detail'].some(field => movement[field]?.trim())
// Rows left completely empty are an editing convenience, never published.
const withoutBlankMovements = form => ({ ...form, skill_strength: { ...form.skill_strength, movements: form.skill_strength.movements.filter(m => !isBlank(m)) }, wod: { ...form.wod, movements: form.wod.movements.filter(m => !isBlank(m)) } })
const emptyForm = () => ({
  session_date: parisNow().date, start_time: '', end_time: '', time_slot: '', title: '',
  warmup: { general: '', specific: '' },
  skill_strength: { kind: 'skill', instructions: '', movements: [blankMovement()] },
  wod: { format: 'AMRAP', duration_or_target: '', notes: '', movements: [blankMovement()] },
})
function fromSession(session) {
  const base = emptyForm()
  const movements = items => items?.length ? items.map(m => ({ ...blankMovement(), ...m, detail: m.detail ?? '' })) : [blankMovement()]
  return { ...base, session_date: session.session_date, start_time: session.start_time || '', end_time: session.end_time || '', time_slot: session.time_slot || '', title: session.title || '',
    warmup: { general: session.warmup?.general ?? '', specific: session.warmup?.specific ?? '' },
    skill_strength: { kind: session.skill_strength?.kind || 'skill', instructions: session.skill_strength?.instructions ?? '', movements: movements(session.skill_strength?.movements) },
    wod: { format: session.wod?.format || 'AMRAP', duration_or_target: session.wod?.duration_or_target ?? '', notes: session.wod?.notes ?? '', movements: movements(session.wod?.movements) },
  }
}
function TextField({ label, value, onChange, multiline = false, ...props }) {
  return <label>{label}{multiline ? <textarea aria-label={label} rows="3" value={value} onChange={e => onChange(e.target.value)} {...props} /> : <input aria-label={label} value={value} onChange={e => onChange(e.target.value)} {...props} />}</label>
}
function MovementEditor({ items, onChange, phase }) {
  const update = (index, field, value) => onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  return <fieldset className="movement-builder"><legend>Mouvements</legend>{items.map((item, index) => <div className="movement-fields" key={index}>
    <div className="movement-heading"><strong>Mouvement {index + 1}</strong><button type="button" className="text-button" aria-label={`Supprimer ${phase} mouvement ${index + 1}`} onClick={() => onChange(items.filter((_, i) => i !== index))}>Supprimer</button></div>
    <TextField label={`Nom · ${phase} ${index + 1}`} value={item.movement_name} onChange={value => update(index, 'movement_name', value)} placeholder="Front squat" required={!isBlank(item)} />
    <div className="two-cols"><TextField label={`Séries / répétitions · ${phase} ${index + 1}`} value={item.sets_reps} onChange={value => update(index, 'sets_reps', value)} placeholder="5 × 3 ou 12 reps" /><TextField label={`Charge · ${phase} ${index + 1}`} value={item.load} onChange={value => update(index, 'load', value)} placeholder="40 kg ou 80 %" /></div>
    <TextField label={`Instructions · ${phase} ${index + 1}`} value={item.instructions} onChange={value => update(index, 'instructions', value)} placeholder="Tempo, amplitude, adaptation…" />
    {item.detail !== '' && <TextField label={`Détail existant · ${phase} ${index + 1}`} value={item.detail} onChange={value => update(index, 'detail', value)} />}
  </div>)}<button type="button" className="button ghost" onClick={() => onChange([...items, blankMovement()])}>Ajouter un mouvement {phase}</button></fieldset>
}
export default function EditorPage() {
  const { id } = useParams()
  const location = useLocation()
  const duplicate = location.pathname.endsWith('/duplicate')
  const navigate = useNavigate()
  const { session: auth, mode } = useAuth()
  const { getSession, saveSession, deleteSession, capabilities } = useSessions()
  const [form, setForm] = useState(emptyForm)
  const [baseline, setBaseline] = useState('')
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const bypass = useRef(false)
  const key = `boxtrack.draft.${mode}.${auth?.user?.email}.${duplicate ? 'duplicate-' : ''}${id || 'new'}`
  const dirty = ready && JSON.stringify(form) !== baseline
  const blocker = useBlocker(({ currentLocation, nextLocation }) => Boolean(auth && dirty && !bypass.current && currentLocation.pathname !== nextLocation.pathname))
  useEffect(() => {
    let active = true
    setReady(false); setLoadError(''); setMessage(''); bypass.current = false
    Promise.resolve(id ? getSession(id) : null).then(item => {
      if (!active) return
      if (id && !item) throw new Error('Cette séance est introuvable.')
      const original = item ? fromSession(item) : emptyForm()
      if (duplicate) original.session_date = addDays(original.session_date < parisNow().date ? parisNow().date : original.session_date, 1)
      let draft
      try { draft = JSON.parse(sessionStorage.getItem(key)) } catch { /* Ignore damaged drafts. */ }
      setForm(draft?.form?.warmup && draft.form.wod && draft.form.skill_strength ? draft.form : original)
      setBaseline(JSON.stringify(original)); setReady(true)
      if (draft) setMessage('Votre brouillon a été restauré. Il n’est pas encore publié.')
    }).catch(err => { if (active) setLoadError(err.message) })
    return () => { active = false }
  }, [id, duplicate, getSession, key])
  useEffect(() => {
    if (dirty) sessionStorage.setItem(key, JSON.stringify({ form }))
    else if (ready) sessionStorage.removeItem(key)
    const beforeUnload = event => { if (dirty && !bypass.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty, form, key, ready])
  const setBlock = (block, field, value) => setForm(current => ({ ...current, [block]: { ...current[block], [field]: value } }))
  const submit = async event => {
    event.preventDefault(); setMessage('')
    if (!ready || saving) return
    if (capabilities.scheduling && (minutes(form.end_time) === null || minutes(form.start_time) === null || minutes(form.end_time) <= minutes(form.start_time))) { setMessage('L’heure de fin doit être après l’heure de début, le même jour.'); return }
    setSaving(true)
    try {
      const payload = withoutBlankMovements({ ...form, time_slot: form.start_time || form.time_slot })
      await saveSession(payload, duplicate ? undefined : id)
      bypass.current = true; sessionStorage.removeItem(key)
      setBaseline(JSON.stringify(form))
      navigate('/admin', { replace: true, state: { notice: duplicate ? 'Séance dupliquée.' : id ? 'Séance modifiée.' : 'Séance créée.' } })
    } catch (err) { setMessage(err.status === 409 ? 'Ce créneau est déjà occupé. Choisissez une autre heure.' : err.status === 401 || err.status === 403 ? 'Reconnectez-vous. Votre brouillon est conservé.' : err.message === 'Failed to fetch' ? 'Enregistrement impossible. Vérifiez le réseau ; votre saisie est conservée.' : err.message) }
    finally { setSaving(false) }
  }
  const remove = async () => {
    setSaving(true); setMessage('')
    try { await deleteSession(id); bypass.current = true; sessionStorage.removeItem(key); navigate('/admin', { replace: true, state: { notice: 'Séance supprimée.' } }) }
    catch (err) { setMessage(err.message) } finally { setSaving(false) }
  }
  if (loadError) return <StatePanel type="error" title="Séance indisponible" message={loadError} action={<Link className="button ghost" to="/admin">Retour au planning</Link>} />
  if (!ready) return <StatePanel title="Chargement de la séance" message="Un instant…" />
  return <>
    <Link className="back-link" to="/admin">← Retour au planning</Link>
    <div className="coach-title"><div><p className="eyebrow">{duplicate ? 'Copie de séance' : 'Programmation'}</p><h1>{duplicate ? 'Dupliquer la séance' : id ? 'Modifier la séance' : 'Créer une séance'}</h1></div></div>
    {message && <p className="notice" role="alert">{message}</p>}
    <form id="session-form" className="editor-form mobile-editor" onSubmit={submit}>
      <fieldset disabled={saving} className="editor-fields"><section className="form-section"><h2>Informations générales</h2>
        <TextField label="Date" type="date" required value={form.session_date} onChange={value => setForm({ ...form, session_date: value })} />
        <div className="two-cols"><TextField label="Heure de début" type="time" required={capabilities.scheduling || !form.time_slot} value={form.start_time} onChange={value => setForm({ ...form, start_time: value, time_slot: value })} /><TextField label="Heure de fin" type="time" required={capabilities.scheduling} disabled={!capabilities.scheduling} value={form.end_time} onChange={value => setForm({ ...form, end_time: value })} /></div>
        {!capabilities.scheduling && <p className="field-help">L’heure de fin et le titre sont disponibles en démonstration seulement. {form.time_slot && !form.start_time ? `Créneau existant conservé : ${form.time_slot}.` : ''}</p>}
        <TextField label="Titre (facultatif)" disabled={!capabilities.title} value={form.title} onChange={value => setForm({ ...form, title: value })} placeholder="Force & conditionnement" />
      </section><section className="form-section"><h2>Warm-Up</h2><TextField label="Warm-Up général" multiline value={form.warmup.general} onChange={value => setBlock('warmup', 'general', value)} /><TextField label="Warm-Up spécifique" multiline value={form.warmup.specific} onChange={value => setBlock('warmup', 'specific', value)} /></section>
      <section className="form-section"><h2>Skill / Strength</h2><div className="segmented" role="group" aria-label="Type de préparation">{['skill', 'strength'].map(kind => <button type="button" key={kind} aria-pressed={form.skill_strength.kind === kind} className={form.skill_strength.kind === kind ? 'active' : ''} onClick={() => setBlock('skill_strength', 'kind', kind)}>{kind === 'skill' ? 'Skill' : 'Strength'}</button>)}</div><TextField label="Consignes Skill / Strength" multiline value={form.skill_strength.instructions} onChange={value => setBlock('skill_strength', 'instructions', value)} /><MovementEditor phase="Skill" items={form.skill_strength.movements} onChange={value => setBlock('skill_strength', 'movements', value)} /></section>
      <section className="form-section"><h2>WOD</h2><fieldset><legend>Format</legend><div className="format-picker">{SESSION_FORMATS.map(format => <button type="button" key={format} aria-pressed={form.wod.format === format} className={form.wod.format === format ? 'active' : ''} onClick={() => setBlock('wod', 'format', format)}>{FORMAT_LABELS[format]}</button>)}</div></fieldset><TextField label="Durée ou objectif" value={form.wod.duration_or_target} onChange={value => setBlock('wod', 'duration_or_target', value)} placeholder="20 min, 21-15-9, cap 15 min…" /><MovementEditor phase="WOD" items={form.wod.movements} onChange={value => setBlock('wod', 'movements', value)} /><TextField label="Remarques du coach" multiline value={form.wod.notes} onChange={value => setBlock('wod', 'notes', value)} /></section>
      {id && !duplicate && <div className="editor-secondary"><Link className="button ghost" to={`/admin/sessions/${id}/duplicate`}>Dupliquer pour un autre créneau</Link><button type="button" className="text-button danger" onClick={() => { setDeleting(true); setMessage('') }}>Supprimer la séance</button></div>}
      <div className="editor-save-bar"><Link className="button ghost" to="/admin">Annuler</Link><button className="button primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div></fieldset>
    </form>
    {blocker.state === 'blocked' && <ConfirmDialog title="Quitter sans enregistrer ?" confirmLabel="Quitter la page" onCancel={() => blocker.reset()} onConfirm={() => { sessionStorage.removeItem(key); blocker.proceed() }}><p>Les changements non enregistrés seront abandonnés.</p></ConfirmDialog>}
    {deleting && <ConfirmDialog title="Supprimer cette séance ?" confirmLabel="Supprimer définitivement" busy={saving} onCancel={() => setDeleting(false)} onConfirm={remove}><p>Cette action est définitive.</p>{message && <p className="form-error" role="alert">{message}</p>}</ConfirmDialog>}
  </>
}
