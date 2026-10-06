export default function StatePanel({ type = 'loading', title, message, action }) {
  return (
    <section className={`state-panel ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="state-symbol" aria-hidden="true">{type === 'loading' ? '↻' : type === 'error' ? '!' : '—'}</span>
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </section>
  )
}
