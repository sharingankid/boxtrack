import { createContext, useContext, useState } from 'react'
import { apiClient } from '../services/apiClient.js'

const AuthContext = createContext(null)
const mode = import.meta.env.VITE_DATA_MODE === 'api' ? 'api' : 'demo'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = sessionStorage.getItem('boxtrack.auth')
    return saved ? JSON.parse(saved) : null
  })

  const login = async (credentials) => {
    const next = mode === 'api'
      ? await apiClient.login(credentials)
      : { token: 'demo-only-token', user: { id: 0, email: credentials.email || 'coach@demo.local' }, demo: true }
    sessionStorage.setItem('boxtrack.auth', JSON.stringify(next))
    setSession(next)
    return next
  }

  const logout = async () => {
    if (mode === 'api' && session?.token) await apiClient.logout(session.token)
    sessionStorage.removeItem('boxtrack.auth')
    setSession(null)
  }

  return <AuthContext.Provider value={{ session, login, logout, mode }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
