import { useTheme } from '../state/ThemeContext.jsx'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <button type="button" className={`theme-toggle ${className}`.trim()} onClick={toggleTheme} aria-label={dark ? 'Activer le mode clair' : 'Activer le mode sombre'} title={dark ? 'Mode clair' : 'Mode sombre'}>
      <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
    </button>
  )
}
