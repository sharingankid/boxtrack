import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { cloneDemoAnnouncements } from '../data/demoAnnouncements.js'
import { apiClient } from '../services/apiClient.js'
import { useAuth } from './AuthContext.jsx'

const AnnouncementsContext = createContext(null)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function AnnouncementsProvider({ children }) {
  const { mode, session: auth } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const demoIdRef = useRef(800)

  // The coach admin view needs inactive announcements too, the public view
  // only ever sees active ones (apiClient.listAnnouncements vs. listAll).
  const refresh = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const data = mode === 'demo'
        ? (await wait(200), cloneDemoAnnouncements())
        : auth ? await apiClient.listAllAnnouncements(auth.token) : await apiClient.listAnnouncements()
      setAnnouncements(data)
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
      setAnnouncements((current) => [saved, ...current])
      return saved
    }
    const saved = await apiClient.createAnnouncement(data, auth.token)
    await refresh()
    return saved
  }

  const update = async (id, data) => {
    if (mode === 'demo') {
      setAnnouncements((current) => current.map((item) => (String(item.id) === String(id) ? { ...item, ...data } : item)))
      return
    }
    await apiClient.updateAnnouncement(id, data, auth.token)
    await refresh()
  }

  const remove = async (id) => {
    if (mode === 'demo') {
      setAnnouncements((current) => current.filter((item) => String(item.id) !== String(id)))
      return
    }
    await apiClient.removeAnnouncement(id, auth.token)
    await refresh()
  }

  return (
    <AnnouncementsContext.Provider value={{ announcements, status, error, refresh, create, update, remove, mode }}>
      {children}
    </AnnouncementsContext.Provider>
  )
}

export const useAnnouncements = () => useContext(AnnouncementsContext)
