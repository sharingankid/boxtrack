import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { cloneDemoSessions } from '../data/demoSessions.js'
import { apiClient } from '../services/apiClient.js'
import { useAuth } from './AuthContext.jsx'

const SessionsContext = createContext(null)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function SessionsProvider({ children }) {
  const { mode, session: auth } = useAuth()
  const [sessions, setSessions] = useState([])
  const sessionsRef = useRef(sessions)
  sessionsRef.current = sessions
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const data = mode === 'demo' ? (await wait(320), cloneDemoSessions()) : await apiClient.history()
      setSessions(data)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [mode])

  useEffect(() => { refresh() }, [refresh])

  const getSession = useCallback(async (id) => {
    const found = sessionsRef.current.find((item) => String(item.id) === String(id))
    if (found) return found
    if (mode === 'demo') return cloneDemoSessions().find((item) => String(item.id) === String(id))
    return apiClient.detail(id)
  }, [mode])

  const saveSession = async (payload, id) => {
    if (mode === 'demo') {
      const saved = { ...payload, id: id ? Number(id) : Date.now() }
      setSessions((current) => id
        ? current.map((item) => String(item.id) === String(id) ? saved : item)
        : [saved, ...current])
      return saved
    }
    const saved = id
      ? await apiClient.update(id, payload, auth.token)
      : await apiClient.create(payload, auth.token)
    await refresh()
    return saved
  }

  return <SessionsContext.Provider value={{ sessions, status, error, refresh, getSession, saveSession, mode }}>{children}</SessionsContext.Provider>
}

export const useSessions = () => useContext(SessionsContext)
