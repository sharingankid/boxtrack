import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createMemberAdapter } from '../services/memberAdapter.js'
const MemberContext = createContext(null)
const mode = import.meta.env.VITE_DATA_MODE === 'demo' ? 'demo' : 'api'
const KEY = `boxtrack.member.${mode}.v1`
// A guest stays a guest for this visit only: the next QR scan asks again.
const GUEST_KEY = 'boxtrack.member.guest'
function restore() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY))
    return value?.token && value.member && new Date(value.expiresAt) > Date.now()
      ? value
      : null
  } catch {
    return null
  }
}
function restoreGuest() {
  try {
    return sessionStorage.getItem(GUEST_KEY) === '1'
  } catch {
    return false
  }
}
// Members' own accounts (QR code on the TV), separate from the coach login.
export function MemberProvider({ children }) {
  const adapter = useMemo(() => createMemberAdapter(mode), [])
  const [account, setAccount] = useState(restore)
  const [guest, setGuest] = useState(restoreGuest)
  const forget = () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* Storage unavailable: the session ends with the page. */
    }
    setAccount(null)
  }
  useEffect(() => {
    // A token restored from storage may have been revoked elsewhere.
    if (account) adapter.me(account.token).catch((err) => err.status === 401 && forget())
    window.addEventListener('boxtrack:member-auth-error', forget)
    return () => window.removeEventListener('boxtrack:member-auth-error', forget)
    // Checked once per visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const save = (result) => {
    const next = { token: result.token, member: result.member, expiresAt: result.expires_at }
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      sessionStorage.removeItem(GUEST_KEY)
    } catch {
      /* Storage unavailable: signed in for this page only. */
    }
    setAccount(next)
    setGuest(false)
  }
  const setGuestMode = (value) => {
    try {
      if (value) sessionStorage.setItem(GUEST_KEY, '1')
      else sessionStorage.removeItem(GUEST_KEY)
    } catch {
      /* Storage unavailable: guest for this page only. */
    }
    setGuest(value)
  }
  const value = {
    mode,
    adapter,
    member: account?.member || null,
    token: account?.token || null,
    guest: !account && guest,
    register: async (data) => save(await adapter.register(data)),
    login: async (credentials) => save(await adapter.login(credentials)),
    logout: async () => {
      try {
        if (account) await adapter.logout(account.token)
      } catch {
        /* Clear local credentials even when the network is unavailable. */
      } finally {
        forget()
      }
    },
    enterAsGuest: () => setGuestMode(true),
    leaveGuest: () => setGuestMode(false),
  }
  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>
}
export const useMember = () => useContext(MemberContext)
