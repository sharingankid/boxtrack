import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import AdminAnnouncementsPage from './pages/AdminAnnouncementsPage.jsx'
import AdminAthletesPage from './pages/AdminAthletesPage.jsx'
import AdminQrCodesPage from './pages/AdminQrCodesPage.jsx'
import AdminRecipesPage from './pages/AdminRecipesPage.jsx'
import AnnouncementsPage from './pages/AnnouncementsPage.jsx'
import EditorPage from './pages/EditorPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import QrCodesPage from './pages/QrCodesPage.jsx'
import RecipeDetailPage from './pages/RecipeDetailPage.jsx'
import RecipesPage from './pages/RecipesPage.jsx'
import ScreenPage from './pages/ScreenPage.jsx'
import SessionPage from './pages/SessionPage.jsx'

export default function App() {
  return <Routes><Route element={<Layout />}><Route index element={<HomePage />} /><Route path="history" element={<HistoryPage />} /><Route path="sessions/:id" element={<SessionPage />} /><Route path="recipes" element={<RecipesPage />} /><Route path="recipes/:id" element={<RecipeDetailPage />} /><Route path="announcements" element={<AnnouncementsPage />} /><Route path="qrcodes" element={<QrCodesPage />} /><Route path="login" element={<LoginPage />} /></Route><Route path="screen" element={<ScreenPage />} /><Route path="admin/sessions/new" element={<EditorPage />} /><Route path="admin/sessions/:id/edit" element={<EditorPage />} /><Route path="admin/recipes" element={<AdminRecipesPage />} /><Route path="admin/athletes" element={<AdminAthletesPage />} /><Route path="admin/announcements" element={<AdminAnnouncementsPage />} /><Route path="admin/qrcodes" element={<AdminQrCodesPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}
