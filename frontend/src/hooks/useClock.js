import { useEffect, useState } from 'react'
import { parisNow } from '../lib/schedule.js'
export default function useClock() {
  const [now, setNow] = useState(parisNow)
  useEffect(() => {
    const timer = setInterval(() => setNow(parisNow()), 1000)
    return () => clearInterval(timer)
  }, [])
  return now
}
