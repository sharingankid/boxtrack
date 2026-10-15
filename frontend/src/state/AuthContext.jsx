import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../services/apiClient.js'
const AuthContext = createContext(null)
const mode = import.meta.env.VITE_DATA_MODE === 'demo' ? 'demo' : 'api'
const KEY = `boxtrack.auth.${mode}.v3`
const allowed = ['owner', 'coach', 'staff']
function restore() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY))
    return value?.token &&
      value.expiresAt > Date.now() &&
      allowed.includes(value.user?.role) &&
      (mode !== 'demo' || value.demo)
      ? value
      : null
  } catch {
    return null
  }
}
export function AuthProvider({ children }) {
  const [session, setSession] = useState(restore)
  const [reason, setReason] = useState(() =>
    localStorage.getItem(KEY) && !restore()
      ? 'Votre session a expiré. Reconnectez-vous pour continuer.'
      : '',
  )
  useEffect(() => {
    const expire = () => {
      localStorage.removeItem(KEY)
      setSession(null)
      setReason(
        'Votre session a expiré. Reconnectez-vous ; votre brouillon est conservé.',
      )
    }
    const synchronize = (event) => {
      if (event.key === KEY) setSession(restore())
    }
    const timer = setInterval(() => {
      if (session && session.expiresAt <= Date.now()) expire()
    }, 1000)
    window.addEventListener('boxtrack:auth-error', expire)
    window.addEventListener('storage', synchronize)
    return () => {
      clearInterval(timer)
      window.removeEventListener('boxtrack:auth-error', expire)
      window.removeEventListener('storage', synchronize)
    }
  }, [session])
  const login = async ({ email, password, role = 'coach' }) => {
    const result =
      mode === 'api'
        ? await apiClient.login({ email, password })
        : { token: 'demo-only-token', user: { email, role }, demo: true }
    if (!allowed.includes(result.user?.role))
      throw new Error('Ce compte n’a pas accès à l’espace coach ou staff.')
    const next = { ...result, expiresAt: Date.now() + 7 * 86400000 }
    localStorage.setItem(KEY, JSON.stringify(next))
    setSession(next)
    setReason('')
  }
  const logout = async () => {
    try {
      if (mode === 'api' && session?.token)
        await apiClient.logout(session.token)
    } catch {
      /* Clear local credentials even when the network is unavailable. */
    } finally {
      localStorage.removeItem(KEY)
      setSession(null)
      setReason('Vous êtes déconnecté.')
    }
  }
  const requireSession = () => {
    if (!session || session.expiresAt <= Date.now()) {
      window.dispatchEvent(new Event('boxtrack:auth-error'))
      throw new Error('Votre session a expiré.')
    }
    return session.token
  }
  return (
    <AuthContext.Provider
      value={{ session, login, logout, mode, reason, requireSession }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
