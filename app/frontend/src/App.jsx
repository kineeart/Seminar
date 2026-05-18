import { Navigate, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import FlashcardLibraryPage from './pages/FlashcardLibraryPage'
import FlashcardStudyPage from './pages/FlashcardStudyPage'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'
import OnboardingPage from './pages/OnboardingPage'
import ProfilePage from './pages/ProfilePage'
import QuizPage from './pages/QuizPage'
import QuizResultPage from './pages/QuizResultPage'
import RoleplayPage from './pages/RoleplayPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/landing" />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/roleplay" element={<RoleplayPage />} />
      <Route path="/flashcards" element={<FlashcardLibraryPage />} />
      <Route path="/flashcards/study" element={<FlashcardStudyPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/quiz/result" element={<QuizResultPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App

