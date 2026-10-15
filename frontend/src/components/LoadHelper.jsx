import { useState } from 'react'
import { formatKg, loadFor, percentages } from '../lib/loads.js'

// Personal 1RMs stay on the athlete's device, never sent to the server.
const STORAGE_KEY = 'boxtrack.one-rep-max.v1'
const keyFor = (name) => name.trim().toLowerCase()
const readAll = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

export default function LoadHelper({ name, detail }) {
  const [value, setValue] = useState(() => readAll()[keyFor(name)] ?? '')
  const [open, setOpen] = useState(false)
  const percents = percentages(detail)
  if (!percents.length) return null
  const oneRepMax = Number(String(value).replace(',', '.'))
  const save = (next) => {
    setValue(next)
    const all = readAll()
    if (next === '') delete all[keyFor(name)]
    else all[keyFor(name)] = next
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)) } catch { /* Not remembered, still computed. */ }
  }
  if (value === '' && !open) return <button type="button" className="load-toggle" onClick={() => setOpen(true)}>Calculer ma charge</button>
  return (
    <div className="load-helper">
      <label>
        <span>Mon 1RM</span>
        <input type="text" inputMode="decimal" autoFocus={open && value === ''} value={value} onChange={(e) => save(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="100" aria-label={`Mon 1RM en kilos, ${name}`} />
        <span>kg</span>
      </label>
      {oneRepMax > 0 && <output>{percents.map((p) => <span key={p}>{p} % → <b>{formatKg(loadFor(oneRepMax, p))} kg</b></span>)}</output>}
    </div>
  )
}
