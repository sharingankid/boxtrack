import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './state/AuthContext.jsx'
import { SessionsProvider } from './state/SessionsContext.jsx'
import { MemberProvider } from './state/MemberContext.jsx'
import './styles.css'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SessionsProvider>
        <MemberProvider>
          <App />
        </MemberProvider>
      </SessionsProvider>
    </AuthProvider>
  </StrictMode>,
)
