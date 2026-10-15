import { FORMAT_LABELS } from '../lib/format.js'
import { FORMAT_CUES } from '../lib/training.js'
import Icon from './Icon.jsx'

const firstLine = (value, fallback) =>
  value
    ?.split('\n')
    .map((part) => part.trim())
    .find(Boolean) || fallback

export default function SessionPreview({ form, className = '', onOpen }) {
  const wodMovements = form.wod.movements.filter((item) =>
    item.movement_name.trim(),
  )
  const skillMovement = form.skill_strength.movements.find((item) =>
    item.movement_name.trim(),
  )
  const format = FORMAT_LABELS[form.wod.format] || 'WOD'
  return (
    <aside
      className={`session-preview ${className}`}
      aria-label="Aperçu TV de la séance"
    >
      <div className="preview-heading">
        <div>
          <span className="eyebrow">VOTRE PROGRAMMATION</span>
          <h2>Aperçu TV</h2>
        </div>
        <span className="preview-tag">16:9</span>
      </div>
      <div className="preview-canvas">
        <header>
          <strong>
            LAB<span>+</span>
          </strong>
          <span>{form.title || 'Entraînement du jour'}</span>
          <time>{form.start_time || '--:--'}</time>
        </header>
        <div className="preview-body">
          <div className="preview-wod">
            <div className="preview-wod-title">
              <strong>WOD du jour</strong>
              <small>
                {format} · {form.wod.duration_or_target || 'Objectif à préciser'}
              </small>
            </div>
            <ol>
              {wodMovements.length ? (
                wodMovements.slice(0, 3).map((item, index) => (
                  <li key={`${item.movement_name}-${index}`}>
                    {item.movement_name}
                  </li>
                ))
              ) : (
                <li className="preview-placeholder">
                  Ajoutez les mouvements du WOD
                </li>
              )}
            </ol>
            <p>{FORMAT_CUES[form.wod.format]}</p>
          </div>
          <div className="preview-phases">
            <div>
              <span>ÉCHAUFFEMENT</span>
              <strong>{firstLine(form.warmup.general, 'À préparer')}</strong>
              <small>
                {firstLine(form.warmup.specific, 'Spécifique à préciser')}
              </small>
            </div>
            {form.skill_strength.kind !== 'none' && (
              <div>
                <span>
                  {form.skill_strength.kind === 'strength'
                    ? 'FORCE'
                    : 'TECHNIQUE'}
                </span>
                <strong>{skillMovement?.movement_name || 'À préparer'}</strong>
                <small>
                  {firstLine(
                    form.skill_strength.instructions,
                    'Consignes à préciser',
                  )}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="preview-caption">
        Aperçu simplifié. La TV affichera la séance à son créneau.
      </p>
      {onOpen && (
        <button type="button" className="preview-open" onClick={onOpen}>
          <Icon name="screen" />
          Vérifier en plein écran
          <Icon name="arrow" />
        </button>
      )}
    </aside>
  )
}
