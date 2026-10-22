import { useEffect, useRef, useState } from 'react'
import { parisNow } from '../lib/schedule.js'
import { toApiPayload } from '../services/sessionAdapter.js'
import { TvProgramme } from '../pages/ScreenPage.jsx'
import Icon from './Icon.jsx'

const BOARD_WIDTH = 1920
const BOARD_HEIGHT = 1080
const viewSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
})

export default function TvPreviewDialog({ form, onClose }) {
  const dialogRef = useRef(null)
  const [viewport, setViewport] = useState(viewSize)
  const [zoomed, setZoomed] = useState(false)
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    window.addEventListener('resize', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
      if (dialog.open) dialog.close()
    }
  }, [])
  const updateSize = () => setViewport(viewSize())
  const fitScale = Math.min(
    (viewport.width - 32) / BOARD_WIDTH,
    (viewport.height - 150) / BOARD_HEIGHT,
    1,
  )
  const scale = zoomed
    ? Math.max(fitScale, Math.min(1, viewport.width / 760))
    : fitScale
  const stageWidth = Math.min(viewport.width - 32, BOARD_WIDTH * scale)
  const stageHeight = Math.min(
    viewport.height - 150,
    BOARD_HEIGHT * scale,
  )
  const session = { ...toApiPayload(form), id: 'preview' }
  return (
    <dialog
      className="tv-preview-dialog"
      ref={dialogRef}
      aria-label="Aperçu plein écran de la vue TV"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div
        className={`tv-preview-stage ${zoomed ? 'is-zoomed' : ''}`}
        style={{ width: stageWidth, height: stageHeight }}
      >
        <div
          className="tv-preview-stage-content"
          style={{ width: BOARD_WIDTH * scale, height: BOARD_HEIGHT * scale }}
        >
          <div
            className="tv-preview-stage-inner"
            style={{ transform: `scale(${scale})` }}
          >
            <TvProgramme
              session={session}
              current={null}
              following={null}
              now={parisNow()}
              preview
            />
          </div>
        </div>
      </div>
      <div className="tv-preview-toolbar">
        <span>
          <strong>APERÇU DE VOTRE TV</strong>
          <small>
            {zoomed
              ? 'Vue agrandie · faites défiler pour parcourir la séance'
              : 'Vue entière 1920 × 1080 · brouillon non publié'}
          </small>
        </span>
        <div className="tv-preview-actions">
          <button
            type="button"
            className="button ghost"
            onClick={() => setZoomed((value) => !value)}
          >
            {zoomed ? 'Vue entière' : 'Agrandir pour lire'}
          </button>
          <button type="button" className="button ghost" onClick={onClose}>
            <Icon name="close" />
            Revenir à l’édition
          </button>
        </div>
      </div>
    </dialog>
  )
}
