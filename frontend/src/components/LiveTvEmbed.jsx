import { useEffect, useRef, useState } from 'react'

const PHONE_QUERY = '(max-width: 760px)'
const WIDTH = 1920
const HEIGHT = 1080

export default function LiveTvEmbed() {
  const [mobile, setMobile] = useState(
    () => window.matchMedia(PHONE_QUERY).matches,
  )
  const [scale, setScale] = useState(0)
  const frameRef = useRef(null)
  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY)
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!mobile) return
    const frame = frameRef.current
    const observer = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / WIDTH),
    )
    observer.observe(frame)
    return () => observer.disconnect()
  }, [mobile])
  if (!mobile) return null
  return (
    <div className="live-tv-embed" ref={frameRef}>
      <div className="live-tv-status">
        <span className="status-dot" />
        TV en direct<span>16:9</span>
      </div>
      <div className="live-tv-viewport" style={{ height: HEIGHT * scale }}>
        <iframe
          title="Vue TV en temps réel"
          src="/screen"
          width={WIDTH}
          height={HEIGHT}
          style={{
            transform: `scale(${scale})`,
            visibility: scale ? 'visible' : 'hidden',
          }}
        />
      </div>
      <p>
        Le même affichage que la TV de la salle, mis à jour automatiquement.
      </p>
    </div>
  )
}
