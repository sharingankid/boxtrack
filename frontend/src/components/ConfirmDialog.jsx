import { useEffect, useRef } from 'react'
export default function ConfirmDialog({ title, children, confirmLabel = 'Confirmer', onConfirm, onCancel, busy = false }) {
  const ref = useRef(null)
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close() }, [])
  return <dialog ref={ref} className="confirm-dialog" aria-labelledby="confirmation-title" onCancel={event => { event.preventDefault(); if (!busy) onCancel() }}>
    <h2 id="confirmation-title">{title}</h2>{children}
    <div className="dialog-actions"><button className="button ghost" autoFocus disabled={busy} onClick={onCancel}>Annuler</button><button className="button primary" disabled={busy} onClick={onConfirm}>{busy ? 'Patientez…' : confirmLabel}</button></div>
  </dialog>
}
