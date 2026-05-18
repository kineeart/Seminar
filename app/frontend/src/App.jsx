import LandingPage from './pages/LandingPage'
import FlashcardsPage from './pages/FlashcardsPage'
import DashboardPage from './pages/DashboardPage'
import './styles/landing.css'

const routes = {
  '/': LandingPage,
  '/landing': LandingPage,
  '/dashboard': DashboardPage,
  '/flashcards': FlashcardsPage,
}

function NotFoundPage() {
  return (
    <main className="landing-page">
      <div className="landing-app fade-in" style={{ alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ color: '#2d2d3a', marginTop: 40 }}>Page not found</h1>
        <a className="btn" href="/landing" style={{ maxWidth: 280 }}>
          Go to Landing Page
        </a>
      </div>
    </main>
  )
}

function App() {
  const pathname = window.location.pathname
  const ActivePage = routes[pathname] ?? NotFoundPage

  return <ActivePage />
}

export default App
