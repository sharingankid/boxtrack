import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from 'react-router-dom'
import ClassTimerPage from './pages/ClassTimerPage.jsx'
import CoachLayout from './components/CoachLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import EditorPage from './pages/EditorPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MemberLayout from './components/MemberLayout.jsx'
import MemberSessionPage from './pages/MemberSessionPage.jsx'
import MemberHistoryPage, { MemberSessionDetailPage } from './pages/MemberHistoryPage.jsx'
import MemberProgressPage from './pages/MemberProgressPage.jsx'
import MemberProfilePage from './pages/MemberProfilePage.jsx'
import ScreenPage from './pages/ScreenPage.jsx'
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/screen" element={<ScreenPage />} />
      <Route path="/chrono" element={<ClassTimerPage />} />
      <Route element={<MemberLayout />}>
        <Route path="/seance" element={<MemberSessionPage />} />
        <Route path="/moi/seances" element={<MemberHistoryPage />} />
        <Route path="/moi/seances/:id" element={<MemberSessionDetailPage />} />
        <Route path="/moi/progres" element={<MemberProgressPage />} />
        <Route path="/moi/profil" element={<MemberProfilePage />} />
      </Route>
      <Route path="/coach" element={<CoachLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="upcoming" element={<DashboardPage />} />
        <Route path="sessions" element={<DashboardPage />} />
        <Route path="sessions/new" element={<EditorPage />} />
        <Route path="sessions/:id/edit" element={<EditorPage />} />
        <Route path="*" element={<Navigate to="/coach" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </>,
  ),
)
export default function App() {
  return <RouterProvider router={router} />
}
