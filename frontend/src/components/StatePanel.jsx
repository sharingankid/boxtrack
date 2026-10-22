import Icon from './Icon.jsx'
export default function StatePanel({
  type = 'loading',
  title,
  message,
  action,
}) {
  return (
    <section
      className={`state-panel ${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-busy={type === 'loading'}
    >
      <span className="state-symbol" aria-hidden="true">
        {type === 'loading' ? (
          <span className="loading-spinner" />
        ) : (
          <Icon name={type === 'error' ? 'bolt' : 'calendar'} />
        )}
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      {type === 'loading' && (
        <div className="loading-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}
      {action}
    </section>
  )
}
