import { useEffect, useRef, useState } from 'react'
import {
  Link,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { formatDate, FORMAT_LABELS, SESSION_FORMATS } from '../lib/format.js'
import { addDays, parisNow } from '../lib/schedule.js'
import { useAuth } from '../state/AuthContext.jsx'
import { useSessions } from '../state/SessionsContext.jsx'
import { movementDetail } from '../services/sessionAdapter.js'
import { validateSession } from '../lib/validation.js'
import Icon from '../components/Icon.jsx'
import { FORMAT_HELP, MOVEMENT_SUGGESTIONS } from '../lib/training.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import StatePanel from '../components/StatePanel.jsx'
import SessionPreview from '../components/SessionPreview.jsx'
import TvPreviewDialog from '../components/TvPreviewDialog.jsx'

const blankMovement = () => ({
  movement_name: '',
  sets: '',
  reps: '',
  load: '',
  instructions: '',
  detail: '',
})
const emptyForm = () => ({
  session_date: parisNow().date,
  start_time: '18:00',
  end_time: '19:00',
  title: '',
  warmup: { general: '', specific: '' },
  skill_strength: {
    kind: 'skill',
    instructions: '',
    movements: [blankMovement()],
  },
  wod: {
    format: 'AMRAP',
    duration_or_target: '',
    notes: '',
    movements: [blankMovement()],
  },
})
function fromSession(session) {
  const base = emptyForm()
  const movements = (items) =>
    items?.length
      ? items.map((m) => ({ ...blankMovement(), ...m, detail: m.detail ?? '' }))
      : [blankMovement()]
  return {
    ...base,
    session_date: session.session_date,
    start_time: session.start_time || '',
    end_time: session.end_time || '',
    title: session.title || '',
    warmup: {
      general: session.warmup?.general ?? '',
      specific: session.warmup?.specific ?? '',
    },
    skill_strength: {
      // No block on the saved session means the coach chose to skip it.
      kind: session.skill_strength
        ? session.skill_strength.kind || 'skill'
        : 'none',
      instructions: session.skill_strength?.instructions ?? '',
      movements: movements(session.skill_strength?.movements),
    },
    wod: {
      format: session.wod?.format || 'AMRAP',
      duration_or_target: session.wod?.duration_or_target ?? '',
      notes: session.wod?.notes ?? '',
      movements: movements(session.wod?.movements),
    },
  }
}
const KIND_OPTIONS = [
  { kind: 'none', label: 'Aucun', hint: 'Directement au WOD' },
  { kind: 'skill', label: 'Skill', hint: 'Travail technique' },
  { kind: 'strength', label: 'Strength', hint: 'Travail de force' },
]
// What a skipped block still holds, so the coach knows nothing is lost.
function keptSummary(block) {
  const count = block.movements.filter((m) => m.movement_name.trim()).length
  return [
    count && `${count} mouvement${count > 1 ? 's' : ''}`,
    block.instructions.trim() && 'des consignes',
  ]
    .filter(Boolean)
    .join(' et ')
}
const SECTION_HINTS = [
  'Date, créneau et titre',
  'Échauffement général et spécifique',
  'Facultatif · travail technique ou de force',
  'Format, mouvements et intention',
  'Relire et publier sur la TV',
]
function EditorSection({ index, title, step, onOpen, children }) {
  return (
    <section className={`form-section ${step === index ? 'is-open' : ''}`}>
      <h2>
        <button
          type="button"
          aria-expanded={step === index}
          aria-controls={`section-${index}`}
          onClick={() => onOpen(index)}
        >
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span className="section-label">
            <strong>{title}</strong>
            <small>{SECTION_HINTS[index]}</small>
          </span>
          <b aria-hidden="true">{step === index ? '−' : '+'}</b>
        </button>
      </h2>
      <div
        className="section-content"
        id={`section-${index}`}
        hidden={step !== index}
      >
        {children}
      </div>
    </section>
  )
}
function TextField({ label, value, onChange, multiline = false, ...props }) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea
          aria-label={label}
          rows="3"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      ) : (
        <input
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      )}
    </label>
  )
}
function MovementEditor({ items, onChange, phase }) {
  const update = (index, field, value) =>
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    )
  return (
    <fieldset className="movement-builder">
      <legend>Mouvements</legend>
      {items.map((item, index) => (
        <div className="movement-fields" key={index}>
          <div className="movement-heading">
            <strong>Mouvement {index + 1}</strong>
            <button
              type="button"
              className="text-button"
              aria-label={`Dupliquer ${phase} mouvement ${index + 1}`}
              onClick={() =>
                onChange([
                  ...items.slice(0, index + 1),
                  { ...item },
                  ...items.slice(index + 1),
                ])
              }
            >
              <Icon name="copy" />
              <span>Dupliquer</span>
            </button>
            <button
              type="button"
              className="text-button"
              aria-label={`Supprimer ${phase} mouvement ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              <Icon name="trash" />
              <span>Supprimer</span>
            </button>
          </div>
          <TextField
            list="movement-suggestions"
            label={`Nom · ${phase} ${index + 1}`}
            value={item.movement_name}
            onChange={(value) => update(index, 'movement_name', value)}
            placeholder="Front squat"
          />
          <div className="two-cols">
            <TextField
              label={`Séries · ${phase} ${index + 1}`}
              value={item.sets}
              onChange={(value) => update(index, 'sets', value)}
              inputMode="numeric"
              placeholder="5"
            />
            <TextField
              label={`Répétitions · ${phase} ${index + 1}`}
              value={item.reps}
              onChange={(value) => update(index, 'reps', value)}
              placeholder="3 ou 21-15-9"
            />
            <TextField
              label={`Charge · ${phase} ${index + 1}`}
              value={item.load}
              onChange={(value) => update(index, 'load', value)}
              placeholder="40 kg ou 80 %"
            />
          </div>
          <TextField
            label={`Instructions · ${phase} ${index + 1}`}
            value={item.instructions}
            onChange={(value) => update(index, 'instructions', value)}
            placeholder="Tempo, amplitude, adaptation…"
          />
          {item.detail !== '' && (
            <TextField
              label={`Détail existant · ${phase} ${index + 1}`}
              value={item.detail}
              onChange={(value) => update(index, 'detail', value)}
            />
          )}
        </div>
      ))}
      <button
        type="button"
        className="button ghost"
        onClick={() => onChange([...items, blankMovement()])}
      >
        <Icon name="plus" />
        Ajouter un mouvement {phase}
      </button>
    </fieldset>
  )
}
export default function EditorPage() {
  const params = useParams()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const sourceId = query.get('duplicate')
  const dateQuery = query.get('date') || ''
  const requestedDate =
    /^\d{4}-\d{2}-\d{2}$/.test(dateQuery) &&
    !Number.isNaN(Date.parse(dateQuery)) &&
    new Date(dateQuery).toISOString().slice(0, 10) === dateQuery
      ? dateQuery
      : ''
  const duplicate = Boolean(sourceId)
  const id = params.id || sourceId
  const navigate = useNavigate()
  const { session: auth, mode, logout } = useAuth()
  const { getSession, saveSession, deleteSession } = useSessions()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(emptyForm)
  const [baseline, setBaseline] = useState('')
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const bypass = useRef(false)
  const lastKind = useRef('skill')
  const key = `boxtrack.draft.${mode}.${auth?.user?.email}.${duplicate ? 'duplicate-' : ''}${id || requestedDate || 'new'}`
  const dirty = ready && JSON.stringify(form) !== baseline
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    Boolean(
      auth &&
      dirty &&
      !bypass.current &&
      currentLocation.pathname + currentLocation.search !==
        nextLocation.pathname + nextLocation.search,
    ),
  )
  useEffect(() => {
    let active = true
    setReady(false)
    setLoadError('')
    setMessage('')
    bypass.current = false
    Promise.resolve(id ? getSession(id) : null)
      .then((item) => {
        if (!active) return
        if (id && !item) throw new Error('Cette séance est introuvable.')
        const original = item ? fromSession(item) : emptyForm()
        if (!id && requestedDate) original.session_date = requestedDate
        if (duplicate)
          original.session_date = addDays(
            original.session_date < parisNow().date
              ? parisNow().date
              : original.session_date,
            1,
          )
        let draft
        try {
          draft = JSON.parse(sessionStorage.getItem(key))
        } catch {
          /* Ignore damaged drafts. */
        }
        setForm(
          draft?.form?.warmup && draft.form.wod && draft.form.skill_strength
            ? draft.form
            : original,
        )
        setBaseline(JSON.stringify(original))
        setReady(true)
        if (draft)
          setMessage(
            'Votre brouillon a été restauré. Il n’est pas encore publié.',
          )
      })
      .catch((err) => {
        if (active) setLoadError(err.message)
      })
    return () => {
      active = false
    }
  }, [id, duplicate, getSession, key, requestedDate])
  useEffect(() => {
    if (dirty) sessionStorage.setItem(key, JSON.stringify({ form }))
    else if (ready) sessionStorage.removeItem(key)
    const beforeUnload = (event) => {
      if (dirty && !bypass.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty, form, key, ready])
  useEffect(() => {
    if (!ready) return
    document
      .getElementById(`section-${step}`)
      ?.parentElement.scrollIntoView({ block: 'start' })
  }, [step, ready])
  useEffect(() => {
    const request = (event) => {
      if (!dirty) return
      event.preventDefault()
      if (!saving) setConfirmLogout(true)
    }
    window.addEventListener('boxtrack:logout-request', request)
    return () => window.removeEventListener('boxtrack:logout-request', request)
  }, [dirty, saving])
  const chooseKind = (kind) => {
    if (kind !== 'none') lastKind.current = kind
    else if (form.skill_strength.kind !== 'none')
      lastKind.current = form.skill_strength.kind
    setBlock('skill_strength', 'kind', kind)
  }
  const skillEmpty =
    !form.skill_strength.instructions.trim() &&
    !form.skill_strength.movements.some((m) => m.movement_name.trim())
  const setBlock = (block, field, value) =>
    setForm((current) => ({
      ...current,
      [block]: { ...current[block], [field]: value },
    }))
  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    if (!ready || saving) return
    const invalid = validateSession(form)
    setErrors(invalid)
    if (Object.keys(invalid).length) {
      setStep(invalid.schedule ? 0 : invalid.skill ? 2 : 3)
      setMessage('Complétez les champs signalés avant d’enregistrer.')
      return
    }
    setSaving(true)
    try {
      const payload = form
      await saveSession(payload, duplicate ? undefined : id)
      bypass.current = true
      sessionStorage.removeItem(key)
      setBaseline(JSON.stringify(form))
      navigate('/coach', {
        replace: true,
        state: {
          notice: duplicate
            ? 'Séance dupliquée.'
            : id
              ? 'Séance modifiée.'
              : 'Séance créée.',
        },
      })
    } catch (err) {
      setMessage(
        err.status === 409
          ? 'Ce créneau est déjà occupé. Choisissez une autre heure.'
          : err.status === 401
            ? 'Reconnectez-vous. Votre brouillon est conservé.'
            : err.message === 'Failed to fetch'
              ? 'Enregistrement impossible. Vérifiez le réseau ; votre saisie est conservée.'
              : err.message,
      )
    } finally {
      setSaving(false)
    }
  }
  const remove = async () => {
    setSaving(true)
    setMessage('')
    try {
      await deleteSession(id)
      bypass.current = true
      sessionStorage.removeItem(key)
      navigate('/coach', {
        replace: true,
        state: { notice: 'Séance supprimée.' },
      })
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }
  if (loadError)
    return (
      <StatePanel
        type="error"
        title="Séance indisponible"
        message={loadError}
        action={
          <Link className="button ghost" to="/coach">
            Retour au planning
          </Link>
        }
      />
    )
  if (!ready)
    return <StatePanel title="Chargement de la séance" message="Un instant…" />
  return (
    <>
      <Link className="back-link" to="/coach">
        <Icon name="arrow" />
        Retour au planning
      </Link>
      <div className="coach-title">
        <div>
          <p className="eyebrow">
            {duplicate ? 'Copie de séance' : 'Programmation'}
          </p>
          <h1>
            {duplicate
              ? 'Dupliquer la séance'
              : id
                ? 'Modifier la séance'
                : 'Créer une séance'}
          </h1>
        </div>
      </div>
      {message && (
        <p className="notice" role="alert">
          {message}
        </p>
      )}
      <datalist id="movement-suggestions">
        {MOVEMENT_SUGGESTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <aside className="editor-summary" aria-label="Résumé permanent">
        <div className="summary-title">
          <Icon name="barbell" />
          <strong>{form.title || 'Nouvelle séance'}</strong>
          <small className="draft-state">
            {dirty ? 'Brouillon conservé' : 'Programmation'}
          </small>
        </div>
        <span>
          {formatDate(form.session_date, {
            weekday: undefined,
            month: 'short',
          })}{' '}
          · de {form.start_time} à {form.end_time}
        </span>
        <span>
          {FORMAT_LABELS[form.wod.format]} ·{' '}
          {form.wod.duration_or_target || 'Objectif à préciser'}
        </span>
      </aside>
      <div className="editor-workspace">
        <div className="editor-compose">
          <div className="editor-progress">
            <p>
              <span>CONSTRUIRE LA SÉANCE</span>
              <strong>Section {step + 1} / 5</strong>
            </p>
            <progress max="5" value={step + 1} />
            <nav aria-label="Sections de la séance">
              {[
                'Informations',
                'Warm-Up',
                'Skill / Strength',
                'WOD',
                'Vérification',
              ].map((label, index) => (
                <button
                  type="button"
                  aria-current={step === index ? 'step' : undefined}
                  key={label}
                  onClick={() => setStep(index)}
                >
                  <b>{index + 1}</b>
                  <span>{label}</span>
                  {index === 2 && form.skill_strength.kind === 'none' && (
                    <em className="step-tag">Aucun</em>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <form
            id="session-form"
            className="editor-form mobile-editor"
            noValidate
            onSubmit={submit}
          >
            <fieldset disabled={saving} className="editor-fields">
              <EditorSection
                index={0}
                title="Informations et horaire"
                step={step}
                onOpen={setStep}
              >
                {errors.schedule && (
                  <p className="form-error" role="alert">
                    {errors.schedule}
                  </p>
                )}
                <TextField
                  label="Date"
                  type="date"
                  required
                  value={form.session_date}
                  onChange={(value) =>
                    setForm({ ...form, session_date: value })
                  }
                />
                <div className="two-cols">
                  <TextField
                    label="Heure de début"
                    type="time"
                    required
                    value={form.start_time}
                    onChange={(value) =>
                      setForm({ ...form, start_time: value })
                    }
                  />
                  <TextField
                    label="Heure de fin"
                    type="time"
                    required
                    value={form.end_time}
                    onChange={(value) => setForm({ ...form, end_time: value })}
                  />
                </div>
                <TextField
                  label="Titre (facultatif)"
                  value={form.title}
                  onChange={(value) => setForm({ ...form, title: value })}
                  placeholder="Force & conditionnement"
                />
              </EditorSection>
              <EditorSection
                index={1}
                title="Warm-Up"
                step={step}
                onOpen={setStep}
              >
                <TextField
                  label="Warm-Up général"
                  multiline
                  value={form.warmup.general}
                  onChange={(value) => setBlock('warmup', 'general', value)}
                />
                <TextField
                  label="Warm-Up spécifique"
                  multiline
                  value={form.warmup.specific}
                  onChange={(value) => setBlock('warmup', 'specific', value)}
                />
              </EditorSection>
              <EditorSection
                index={2}
                title="Skill / Strength"
                step={step}
                onOpen={setStep}
              >
                {errors.skill && (
                  <p className="form-error" role="alert">
                    {errors.skill}
                  </p>
                )}
                <div
                  className="kind-picker"
                  role="group"
                  aria-label="Bloc Skill / Strength"
                >
                  {KIND_OPTIONS.map(({ kind, label, hint }) => (
                    <button
                      type="button"
                      key={kind}
                      aria-pressed={form.skill_strength.kind === kind}
                      className={`kind-option ${form.skill_strength.kind === kind ? 'active' : ''}`}
                      onClick={() => chooseKind(kind)}
                    >
                      <strong>{label}</strong>
                      <small>{hint}</small>
                    </button>
                  ))}
                </div>
                {form.skill_strength.kind === 'none' ? (
                  <div className="kind-skipped" role="status">
                    <p>
                      <strong>Pas de bloc Skill / Strength.</strong> La TV
                      affiche l’échauffement puis le WOD.
                    </p>
                    {keptSummary(form.skill_strength) && (
                      <p className="kind-kept">
                        <span>
                          Mis de côté : {keptSummary(form.skill_strength)}. Rien
                          ne sera publié.
                        </span>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => chooseKind(lastKind.current)}
                        >
                          Réactiver le bloc
                        </button>
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {skillEmpty && (
                      <button
                        type="button"
                        className="kind-skip"
                        onClick={() => {
                          chooseKind('none')
                          setStep(3)
                        }}
                      >
                        Pas de Skill / Strength aujourd’hui ? Passer au WOD →
                      </button>
                    )}
                    <TextField
                      label={`Consignes ${form.skill_strength.kind === 'strength' ? 'Strength' : 'Skill'}`}
                      multiline
                      value={form.skill_strength.instructions}
                      onChange={(value) =>
                        setBlock('skill_strength', 'instructions', value)
                      }
                    />
                    <MovementEditor
                      phase="Skill"
                      items={form.skill_strength.movements}
                      onChange={(value) =>
                        setBlock('skill_strength', 'movements', value)
                      }
                    />
                  </>
                )}
              </EditorSection>
              <EditorSection index={3} title="WOD" step={step} onOpen={setStep}>
                {errors.wod && (
                  <p className="form-error" role="alert">
                    {errors.wod}
                  </p>
                )}
                <fieldset>
                  <legend>Format</legend>
                  <div className="format-picker">
                    {SESSION_FORMATS.map((format) => (
                      <button
                        type="button"
                        key={format}
                        aria-pressed={form.wod.format === format}
                        className={form.wod.format === format ? 'active' : ''}
                        onClick={() => setBlock('wod', 'format', format)}
                      >
                        {FORMAT_LABELS[format]}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <p className="format-explanation">
                  <Icon name="bolt" />
                  <span>
                    <strong>{FORMAT_LABELS[form.wod.format]}</strong> :{' '}
                    {FORMAT_HELP[form.wod.format]}
                  </span>
                </p>
                <TextField
                  label="Durée ou objectif"
                  value={form.wod.duration_or_target}
                  onChange={(value) =>
                    setBlock('wod', 'duration_or_target', value)
                  }
                  placeholder="20 min, 21-15-9, cap 15 min…"
                />
                <MovementEditor
                  phase="WOD"
                  items={form.wod.movements}
                  onChange={(value) => setBlock('wod', 'movements', value)}
                />
                <TextField
                  label="Remarques du coach"
                  multiline
                  value={form.wod.notes}
                  onChange={(value) => setBlock('wod', 'notes', value)}
                />
              </EditorSection>
              <EditorSection
                index={4}
                title="Vérification et enregistrement"
                step={step}
                onOpen={setStep}
              >
                <p className="field-help">
                  Touchez une partie pour la modifier. Enregistrer programme la
                  séance pour la TV.
                </p>
                <SessionPreview
                  form={form}
                  className="preview-inline"
                  onOpen={() => setPreviewOpen(true)}
                />
                {['Informations', 'Warm-Up', 'Skill / Strength', 'WOD'].map(
                  (label, index) => (
                    <button
                      type="button"
                      className="review-block"
                      key={label}
                      onClick={() => setStep(index)}
                    >
                      <strong>
                        {label} <span>Modifier →</span>
                      </strong>
                      {index === 0 ? (
                        <p>
                          {form.title || 'Sans titre'} · {form.session_date}
                          <br />
                          de {form.start_time} à {form.end_time}
                        </p>
                      ) : index === 1 ? (
                        <>
                          <p>
                            Général : {form.warmup.general || 'Non renseigné'}
                          </p>
                          <p>
                            Spécifique :{' '}
                            {form.warmup.specific || 'Non renseigné'}
                          </p>
                        </>
                      ) : index === 2 && form.skill_strength.kind === 'none' ? (
                        <p>Aucun bloc Skill / Strength</p>
                      ) : (
                        <>
                          <p>
                            {index === 2
                              ? form.skill_strength.kind
                              : `${FORMAT_LABELS[form.wod.format]} · ${form.wod.duration_or_target}`}
                          </p>
                          {(index === 2
                            ? form.skill_strength
                            : form.wod
                          ).movements
                            .filter((m) => m.movement_name)
                            .map((m, i) => (
                              <p key={i}>
                                {m.movement_name} · {movementDetail(m)}
                              </p>
                            ))}
                          <p>
                            {index === 2
                              ? form.skill_strength.instructions
                              : form.wod.notes}
                          </p>
                        </>
                      )}
                    </button>
                  ),
                )}
              </EditorSection>
              {step < 4 && (
                <button
                  type="button"
                  className="button primary wide next-section"
                  onClick={() => setStep(step + 1)}
                >
                  Continuer :{' '}
                  {
                    ['', 'Warm-Up', 'Skill / Strength', 'WOD', 'Vérification'][
                      step + 1
                    ]
                  }{' '}
                  →
                </button>
              )}
              {id && !duplicate && (
                <div className="editor-secondary">
                  <Link
                    className="button ghost"
                    to={`/coach/sessions/new?duplicate=${id}`}
                  >
                    Dupliquer pour un autre créneau
                  </Link>
                  <button
                    type="button"
                    className="text-button danger"
                    onClick={() => {
                      setDeleting(true)
                      setMessage('')
                    }}
                  >
                    Supprimer la séance
                  </button>
                </div>
              )}
            </fieldset>
            <div className="editor-save-bar">
              <span className="save-bar-note">
                <Icon name="check" />
                {saving
                  ? 'Publication de la séance…'
                  : dirty
                    ? 'Brouillon conservé sur cet appareil'
                    : 'Enregistrer programme la séance'}
              </span>
              <Link className="button ghost" to="/coach">
                Annuler
              </Link>
              <button className="button primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="loading-spinner" />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <Icon name="check" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <SessionPreview
          form={form}
          className="preview-sidebar"
          onOpen={() => setPreviewOpen(true)}
        />
      </div>
      {previewOpen && (
        <TvPreviewDialog form={form} onClose={() => setPreviewOpen(false)} />
      )}
      {confirmLogout && (
        <ConfirmDialog
          title="Se déconnecter sans enregistrer ?"
          confirmLabel="Se déconnecter"
          onCancel={() => setConfirmLogout(false)}
          onConfirm={() => {
            bypass.current = true
            logout()
          }}
        >
          <p>
            Vos changements ne sont pas publiés. Le brouillon sera conservé sur
            cet appareil.
          </p>
        </ConfirmDialog>
      )}
      {blocker.state === 'blocked' && (
        <ConfirmDialog
          title="Quitter sans enregistrer ?"
          confirmLabel="Quitter la page"
          onCancel={() => blocker.reset()}
          onConfirm={() => {
            sessionStorage.removeItem(key)
            blocker.proceed()
          }}
        >
          <p>Les changements non enregistrés seront abandonnés.</p>
        </ConfirmDialog>
      )}
      {deleting && (
        <ConfirmDialog
          title="Supprimer cette séance ?"
          confirmLabel="Supprimer définitivement"
          busy={saving}
          onCancel={() => setDeleting(false)}
          onConfirm={remove}
        >
          <p>Cette action est définitive.</p>
          {message && (
            <p className="form-error" role="alert">
              {message}
            </p>
          )}
        </ConfirmDialog>
      )}
    </>
  )
}
