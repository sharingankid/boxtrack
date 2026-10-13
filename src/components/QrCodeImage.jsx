import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QrCodeImage({ url, size = 220 }) {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    let active = true
    QRCode.toDataURL(url, { width: size, margin: 1, color: { dark: '#11110f', light: '#ffffff' } })
      .then((result) => { if (active) setDataUrl(result) })
      .catch(() => { if (active) setDataUrl('') })
    return () => { active = false }
  }, [url, size])

  if (!dataUrl) return <div className="qr-placeholder" style={{ width: size, height: size }} aria-hidden="true" />
  return <img className="qr-image" src={dataUrl} alt={`QR code vers ${url}`} width={size} height={size} />
}
