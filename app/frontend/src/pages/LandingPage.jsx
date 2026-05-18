import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const featureCards = [
  { title: 'AI Tutor Chat', description: 'Ask anything. Get short, useful answers.', icon: '💬' },
  { title: 'Smart Flashcards', description: 'AI generates cards from your weak spots.', icon: '🃏' },
  { title: 'Adaptive Quizzes', description: 'Practice for your real exam target.', icon: '🎯' },
]

function LandingPage() {
  const { user, loading } = useAuth()

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="landing-page">
      <div className="landing-app fade-in">
        <header className="landing-header">
          <div className="chip">✨ AI English Learning</div>
          <h1>
            Learn English
            <br />
            the smart way.
          </h1>
          <p>
            Your personal AI tutor for TOEIC, IELTS, VSTEP — concise, practical, no fluff.
          </p>
        </header>

        <div className="col" style={{ marginTop: '18px' }}>
          <Link className="btn" to="/login">
            🚀 Start Learning
          </Link>
          <Link className="btn ghost" to="/onboarding">
            Continue as Guest
          </Link>
        </div>

        <section className="features">
          {featureCards.map((feature) => (
            <div key={feature.title} className="card-base row" style={{ gap: '14px' }}>
              <div className="feature-icon">{feature.icon}</div>
              <div>
                <h3>{feature.title}</h3>
                <p className="muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </section>

        <footer className="landing-footer">
          <p className="muted">Made for TOEIC · IELTS · VSTEP learners</p>
        </footer>
      </div>
    </main>
  )
}

export default LandingPage
