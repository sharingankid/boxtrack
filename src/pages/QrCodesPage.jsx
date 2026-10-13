import QrCodeImage from '../components/QrCodeImage.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { useQrCodes } from '../state/QrCodesContext.jsx'

export default function QrCodesPage() {
  const { qrCodes, status, error, refresh } = useQrCodes()

  if (status === 'loading') return <div className="tv-state"><StatePanel title="Chargement des QR codes" message="Un instant…" /></div>
  if (status === 'error') return <div className="tv-state"><StatePanel type="error" title="QR codes indisponibles" message={error} action={<button className="button primary" onClick={refresh}>Réessayer</button>} /></div>

  return (
    <main className="qr-screen">
      <header><div className="brand light"><span className="brand-mark">BT</span><span><strong>BOXTRACK</strong><small>CROSSFIT LAB</small></span></div></header>
      {qrCodes.length === 0
        ? <p className="muted">Aucun QR code configuré.</p>
        : <div className="qr-grid">
            {qrCodes.map((qr) => (
              <div className="qr-card" key={qr.id}>
                <QrCodeImage url={qr.url} />
                <span>{qr.label}</span>
              </div>
            ))}
          </div>}
    </main>
  )
}
