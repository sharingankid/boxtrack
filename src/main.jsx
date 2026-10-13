import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AnnouncementsProvider } from './state/AnnouncementsContext.jsx'
import { AthletesProvider } from './state/AthletesContext.jsx'
import { AuthProvider } from './state/AuthContext.jsx'
import { QrCodesProvider } from './state/QrCodesContext.jsx'
import { RecipesProvider } from './state/RecipesContext.jsx'
import { SessionsProvider } from './state/SessionsContext.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SessionsProvider>
          <RecipesProvider>
            <AthletesProvider>
              <AnnouncementsProvider>
                <QrCodesProvider>
                  <App />
                </QrCodesProvider>
              </AnnouncementsProvider>
            </AthletesProvider>
          </RecipesProvider>
        </SessionsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
