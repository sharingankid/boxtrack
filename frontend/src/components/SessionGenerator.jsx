import { useState } from 'react'
import {
  generateSession,
  GENERATOR_EQUIPMENT,
} from '../lib/sessionGenerator.js'
import { FORMAT_LABELS } from '../lib/format.js'
import ConfirmDialog from './ConfirmDialog.jsx'
import Icon from './Icon.jsx'

export default function SessionGenerator({ form, onApply, disabled }) {
  const [options, setOptions] = useState({
    goal: 'mixed',
    level: 'beginner',
    duration: 60,
    format: 'AMRAP',
    equipment: [],
    exclude: '',
  })
  const [proposal, setProposal] = useState(null)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)
  const update = (field, value) => {
    setOptions((previous) => ({ ...previous, [field]: value }))
    setProposal(null)
    setError('')
  }
  const generate = (event) => {
    event.preventDefault()
    try {
      setProposal(generateSession({ ...options, startTime: form.start_time }))
      setError('')
    } catch (err) {
      setError(err.message)
      setProposal(null)
    }
  }
  const apply = () => {
    // Recompute the end against the current schedule if the coach edited the start meanwhile.
    const plan = { ...proposal }
    try {
      plan.end_time = generateSession({
        ...options,
        startTime: form.start_time,
      }).end_time
    } catch (err) {
      setError(err.message)
      setConfirm(false)
      return
    }
    onApply(plan)
    setConfirm(false)
    setProposal(null)
  }
  const requestApply = () => {
    const hasContent =
      form.title.trim() ||
      form.warmup.general.trim() ||
      form.warmup.specific.trim() ||
      form.skill_strength.instructions.trim() ||
      form.wod.notes.trim() ||
      form.wod.duration_or_target.trim() ||
      [...form.skill_strength.movements, ...form.wod.movements].some((item) =>
        Object.values(item).some(Boolean),
      )
    if (hasContent) setConfirm(true)
    else apply()
  }
  return (
    <details className="session-generator">
      <summary>
        <Icon name="bolt" />
        <span>
          <strong>Générer une séance</strong>
          <small>Une proposition à personnaliser avant publication</small>
        </span>
        <span className="generator-toggle" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="generator-body">
        <form onSubmit={generate}>
          <fieldset disabled={disabled}>
            <div className="generator-grid">
              <label>
                Objectif
                <select
                  aria-label="Objectif"
                  value={options.goal}
                  onChange={(e) => update('goal', e.target.value)}
                >
                  <option value="mixed">Équilibré</option>
                  <option value="strength">Force</option>
                  <option value="cardio">Endurance</option>
                </select>
              </label>
              <label>
                Niveau
                <select
                  aria-label="Niveau"
                  value={options.level}
                  onChange={(e) => update('level', e.target.value)}
                >
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Confirmé</option>
                </select>
              </label>
              <label>
                Durée totale
                <select
                  aria-label="Durée totale"
                  value={options.duration}
                  onChange={(e) => update('duration', Number(e.target.value))}
                >
                  {[30, 45, 60, 75].map((value) => (
                    <option key={value} value={value}>
                      {value} min
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Format du WOD
                <select
                  aria-label="Format du WOD"
                  value={options.format}
                  onChange={(e) => update('format', e.target.value)}
                >
                  {['AMRAP', 'EMOM', 'FOR_TIME'].map((value) => (
                    <option key={value} value={value}>
                      {FORMAT_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset className="generator-equipment">
              <legend>Matériel disponible</legend>
              <p className="muted">
                Le poids du corps est toujours disponible.
              </p>
              <div>
                {GENERATOR_EQUIPMENT.map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="checkbox"
                      checked={options.equipment.includes(value)}
                      onChange={(e) =>
                        update(
                          'equipment',
                          e.target.checked
                            ? [...options.equipment, value]
                            : options.equipment.filter(
                                (item) => item !== value,
                              ),
                        )
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label>
              Mouvements à exclure
              <input
                aria-label="Mouvements à exclure"
                value={options.exclude}
                onChange={(e) => update('exclude', e.target.value)}
                placeholder="Ex. : burpee, squat, push-up"
              />
              <small>Séparez les noms ou mots-clés par des virgules.</small>
            </label>
            <p className="generator-schedule">
              Début à {form.start_time || 'préciser'} · la durée choisie
              ajustera l’heure de fin. La date reste inchangée.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="button ghost">
              <Icon name="bolt" />
              {proposal ? 'Nouvelle proposition' : 'Préparer une proposition'}
            </button>
          </fieldset>
        </form>
        {proposal && (
          <section
            className="generator-proposal"
            aria-label="Proposition de séance"
            aria-live="polite"
          >
            <p className="eyebrow">PROPOSITION · NON PUBLIÉE</p>
            <h3>{proposal.title}</h3>
            <p>
              {options.duration} min · fin prévue à {proposal.end_time} ·{' '}
              {FORMAT_LABELS[proposal.wod.format]}
            </p>
            <h4>Échauffement</h4>
            <p>{proposal.warmup.general}</p>
            <p>{proposal.warmup.specific}</p>
            <h4>
              {proposal.skill_strength.kind === 'strength'
                ? 'Force'
                : 'Technique'}
            </h4>
            <p>
              {proposal.skill_strength.movements[0].movement_name} · 3 séries ·{' '}
              {proposal.skill_strength.movements[0].reps} répétitions
            </p>
            <p>{proposal.skill_strength.instructions}</p>
            <h4>WOD · {proposal.wod.duration_or_target}</h4>
            <ul>
              {proposal.wod.movements.map((item) => (
                <li key={item.movement_name}>
                  <strong>{item.movement_name}</strong> · {item.reps}{' '}
                  {['Row', 'Bike'].includes(item.movement_name)
                    ? 'calories'
                    : item.movement_name === 'Marche dynamique sur place'
                      ? 'pas'
                      : 'répétitions'}
                  {item.instructions && ` · ${item.instructions}`}
                </li>
              ))}
            </ul>
            <p className="generator-notes">{proposal.wod.notes}</p>
            <button
              type="button"
              className="button primary"
              disabled={disabled}
              onClick={requestApply}
            >
              Utiliser cette proposition
              <Icon name="arrow" />
            </button>
          </section>
        )}
      </div>
      {confirm && (
        <ConfirmDialog
          title="Remplacer le contenu de la séance ?"
          confirmLabel="Utiliser la proposition"
          onCancel={() => setConfirm(false)}
          onConfirm={apply}
        >
          <p>
            Le titre, l’échauffement, le bloc technique ou force et le WOD
            seront remplacés. L’heure de fin sera ajustée à la durée choisie. La
            séance ne sera publiée qu’après enregistrement.
          </p>
        </ConfirmDialog>
      )}
    </details>
  )
}
