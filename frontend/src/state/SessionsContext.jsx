import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createSessionAdapter } from '../services/sessionAdapter.js'
import { useAuth } from './AuthContext.jsx'

const SessionsContext = createContext(null)
export function SessionsProvider({ children }) {
  const { mode, requireSession, session } = useAuth()
  const adapter = useMemo(() => createSessionAdapter(mode), [mode])
  const [sessions, setSessions] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const requestVersion = useRef(0)
  const invalidate = useCallback(() => {
    requestVersion.current++
  }, [])
  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (
        !session &&
        (mode === 'api' || window.location.pathname !== '/screen')
      )
        return
      const version = ++requestVersion.current
      if (!silent) setStatus('loading')
      try {
        const data = await adapter.list()
        if (version !== requestVersion.current) return
        setSessions(data)
        setStatus('ready')
        setError('')
      } catch {
        if (version !== requestVersion.current) return
        setError('Connexion indisponible. Vérifiez le réseau puis réessayez.')
        setStatus('error')
      }
    },
    [adapter, session, mode],
  )
  useEffect(() => {
    refresh()
    const onStorage = () => refresh({ silent: true })
    window.addEventListener('storage', onStorage)
    return () => {
      invalidate()
      window.removeEventListener('storage', onStorage)
    }
  }, [refresh, invalidate])
  const getSession = useCallback((id) => adapter.detail(id), [adapter])
  const saveSession = async (form, id) => {
    const saved = await adapter.save(form, id, requireSession())
    requestVersion.current++
    setSessions((current) => [
      ...current.filter((s) => String(s.id) !== String(saved.id)),
      saved,
    ])
    setStatus('ready')
    setError('')
    return saved
  }
  const deleteSession = async (id) => {
    await adapter.remove(id, requireSession())
    requestVersion.current++
    setSessions((current) => current.filter((s) => String(s.id) !== String(id)))
  }
  return (
    <SessionsContext.Provider
      value={{
        sessions,
        status,
        error,
        refresh,
        getSession,
        saveSession,
        deleteSession,
        mode,
      }}
    >
      {children}
    </SessionsContext.Provider>
  )
}
export const useSessions = () => useContext(SessionsContext)
