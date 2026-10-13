import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { cloneDemoQrCodes } from '../data/demoQrCodes.js'
import { apiClient } from '../services/apiClient.js'
import { useAuth } from './AuthContext.jsx'

const QrCodesContext = createContext(null)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function QrCodesProvider({ children }) {
  const { mode, session: auth } = useAuth()
  const [qrCodes, setQrCodes] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const demoIdRef = useRef(700)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const data = mode === 'demo' ? (await wait(200), cloneDemoQrCodes()) : await apiClient.listQrCodes()
      setQrCodes(data)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [mode])

  useEffect(() => { refresh() }, [refresh])

  const create = async (data) => {
    if (mode === 'demo') {
      const saved = { ...data, id: demoIdRef.current++, order_index: qrCodes.length }
      setQrCodes((current) => [...current, saved])
      return saved
    }
    const saved = await apiClient.createQrCode(data, auth.token)
    await refresh()
    return saved
  }

  const remove = async (id) => {
    if (mode === 'demo') {
      setQrCodes((current) => current.filter((item) => String(item.id) !== String(id)))
      return
    }
    await apiClient.removeQrCode(id, auth.token)
    await refresh()
  }

  return (
    <QrCodesContext.Provider value={{ qrCodes, status, error, refresh, create, remove, mode }}>
      {children}
    </QrCodesContext.Provider>
  )
}

export const useQrCodes = () => useContext(QrCodesContext)
