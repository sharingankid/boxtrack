import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './state/AuthContext.jsx'
import { SessionsProvider } from './state/SessionsContext.jsx'
import { ThemeProvider } from './state/ThemeContext.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <SessionsProvider>
            <App />
          </SessionsProvider>
        </AuthProvider>
      </ThemeProvider>
  </StrictMode>,
)
