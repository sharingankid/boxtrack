import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import AdminLayout, { LogoutPage } from './components/AdminLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import EditorPage from './pages/EditorPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ScreenPage from './pages/ScreenPage.jsx'
import SessionPage from './pages/SessionPage.jsx'
const router = createBrowserRouter(createRoutesFromElements(<>
  <Route element={<Layout />}><Route index element={<HomePage />} /><Route path="history" element={<HistoryPage />} /><Route path="sessions/:id" element={<SessionPage />} /></Route>
  <Route path="login" element={<LoginPage />} />
  <Route path="screen" element={<ScreenPage />} />
  <Route path="admin" element={<AdminLayout />}><Route index element={<DashboardPage />} /><Route path="history" element={<DashboardPage />} /><Route path="sessions/new" element={<EditorPage />} /><Route path="sessions/:id/edit" element={<EditorPage />} /><Route path="sessions/:id/duplicate" element={<EditorPage />} /><Route path="logout" element={<LogoutPage />} /><Route path="*" element={<Navigate to="/admin" replace />} /></Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</>))
export default function App() { return <RouterProvider router={router} /> }
