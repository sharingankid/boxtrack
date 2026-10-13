import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { cloneDemoAthletes } from '../data/demoAthletes.js'
import { apiClient } from '../services/apiClient.js'
import { useAuth } from './AuthContext.jsx'

const AthletesContext = createContext(null)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function AthletesProvider({ children }) {
  const { mode, session: auth } = useAuth()
  const [athletes, setAthletes] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const demoIdRef = useRef(900)

  const refresh = useCallback(async () => {
    // Athletes are coach-only data (no public read per the CDC) - nothing
    // to fetch for an anonymous visitor.
    if (!auth) {
      setAthletes([])
      setStatus('ready')
      return
    }
    setStatus('loading')
    setError('')
    try {
      const data = mode === 'demo' ? (await wait(200), cloneDemoAthletes()) : await apiClient.listAthletes(auth.token)
      setAthletes(data)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [mode, auth])

  useEffect(() => { refresh() }, [refresh])

  const create = async (data) => {
    if (mode === 'demo') {
      const saved = { ...data, id: demoIdRef.current++, active: true }
      setAthletes((current) => [...current, saved])
      return saved
    }
    const saved = await apiClient.createAthlete(data, auth.token)
    await refresh()
    return saved
  }

  const update = async (id, data) => {
    if (mode === 'demo') {
      setAthletes((current) => current.map((item) => (String(item.id) === String(id) ? { ...item, ...data } : item)))
      return
    }
    await apiClient.updateAthlete(id, data, auth.token)
    await refresh()
  }

  const toggleActive = (athlete) => update(athlete.id, { active: !athlete.active })

  return (
    <AthletesContext.Provider value={{ athletes, status, error, refresh, create, update, toggleActive, mode }}>
      {children}
    </AthletesContext.Provider>
  )
}

export const useAthletes = () => useContext(AthletesContext)
