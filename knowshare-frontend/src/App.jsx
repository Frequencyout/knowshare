import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const TagsPage = lazy(() => import('./pages/TagsPage'))
const TagDetailPage = lazy(() => import('./pages/TagDetailPage'))
const AskQuestionPage = lazy(() => import('./pages/AskQuestionPage'))
const QuestionDetailPage = lazy(() => import('./pages/QuestionDetailPage'))
const BadgesPage = lazy(() => import('./pages/BadgesPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/ask" element={<RequireAuth><AskQuestionPage /></RequireAuth>} />
            <Route path="/question/:idOrSlug" element={<QuestionDetailPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tags/:slug" element={<TagDetailPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
