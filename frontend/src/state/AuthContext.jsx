import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../services/apiClient.js'

const AuthContext = createContext(null)
const mode = import.meta.env.VITE_DATA_MODE === 'api' ? 'api' : 'demo'
const KEY = `boxtrack.auth.${mode}.v2`
const readSession = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY))
    // The current API offers no read-only session validation endpoint. Fail closed
    // on full-page reload in API mode rather than trusting a stored bearer token.
    return mode === 'demo' && saved?.demo === true && saved.expiresAt > Date.now() && ['coach', 'staff'].includes(saved.user?.role) ? saved : null
  } catch { return null }
}
export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const [reason, setReason] = useState(() => mode === 'api' && sessionStorage.getItem(KEY) ? 'Vérifiez votre session en vous reconnectant.' : '')
  const expire = (message) => { sessionStorage.removeItem(KEY); setSession(null); setReason(message) }
  useEffect(() => {
    const onError = event => expire(event.detail === 403 ? 'Votre compte n’a pas accès à cette action. Reconnectez-vous avec un compte autorisé.' : 'Votre session a expiré. Reconnectez-vous pour continuer.')
    window.addEventListener('boxtrack:auth-error', onError)
    const timer = setInterval(() => { if (session && session.expiresAt <= Date.now()) expire('Votre session a expiré. Reconnectez-vous pour continuer.') }, 1000)
    return () => { clearInterval(timer); window.removeEventListener('boxtrack:auth-error', onError) }
  }, [session])
  const login = async ({ email, password, role = 'coach' }) => {
    const result = mode === 'api' ? await apiClient.login({ email, password }) : { token: 'demo-only-token', user: { id: 0, email, role }, demo: true }
    const next = { ...result, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }
    sessionStorage.setItem(KEY, JSON.stringify(next)); setSession(next); setReason('')
  }
  const logout = async () => {
    try { if (mode === 'api' && session?.token) await apiClient.logout(session.token) }
    catch { /* Local credentials must be cleared even if the server is offline. */ }
    finally { expire('Vous êtes déconnecté.') }
  }
  const requireSession = () => {
    if (!session || session.expiresAt <= Date.now()) {
      expire('Votre session a expiré. Reconnectez-vous pour continuer.')
      throw new Error('Votre session a expiré.')
    }
    return session.token
  }
  return <AuthContext.Provider value={{ session, login, logout, mode, reason, requireSession }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
