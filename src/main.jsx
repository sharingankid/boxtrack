import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './state/AuthContext.jsx'
import { RecipesProvider } from './state/RecipesContext.jsx'
import { SessionsProvider } from './state/SessionsContext.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SessionsProvider>
          <RecipesProvider>
            <App />
          </RecipesProvider>
        </SessionsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
