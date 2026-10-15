import { useEffect, useState } from 'react'
import { sessionShareText } from '../lib/share.js'

export default function ShareButton({ session }) {
  const [feedback, setFeedback] = useState('')
  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(''), 2500)
    return () => clearTimeout(timer)
  }, [feedback])
  const share = async () => {
    const url = window.location.href
    const text = sessionShareText(session)
    try {
      if (navigator.share) { await navigator.share({ title: 'Séance CrossFit LAB', text, url }); return }
      await navigator.clipboard.writeText(`${text}\n\n${url}`)
      setFeedback('Séance copiée')
    } catch (error) {
      if (error?.name !== 'AbortError') setFeedback('Copie impossible')
    }
  }
  return (
    <button type="button" className="button ghost" onClick={share}>
      <span aria-live="polite">{feedback || 'Partager'}</span>
    </button>
  )
}
