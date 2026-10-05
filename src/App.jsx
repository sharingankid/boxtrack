import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import EditorPage from './pages/EditorPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ScreenPage from './pages/ScreenPage.jsx'
import SessionPage from './pages/SessionPage.jsx'

export default function App() {
  return <Routes><Route element={<Layout />}><Route index element={<HomePage />} /><Route path="history" element={<HistoryPage />} /><Route path="sessions/:id" element={<SessionPage />} /><Route path="login" element={<LoginPage />} /></Route><Route path="screen" element={<ScreenPage />} /><Route path="admin/sessions/new" element={<EditorPage />} /><Route path="admin/sessions/:id/edit" element={<EditorPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}
