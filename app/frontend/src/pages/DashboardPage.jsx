import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import useDashboard from '../hooks/useDashboard'

function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { stats, recentDecks, loading } = useDashboard()

  const displayName = user?.name || 'Learner'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <MainLayout navActive="home">
      {/* Header */}
      <header className="between" style={{ paddingTop: '8px' }}>
        <div>
          <p className="muted">Good morning ☀️</p>
          <h1>Hi, {displayName}!</h1>
        </div>
        <div className="avatar-circle">{initial}</div>
      </header>

      {loading ? (
        <LoadingSpinner text="Loading your progress..." />
      ) : (
        <>
          {/* Stats row */}
          <div className="glass stats-row">
            {(stats || []).map((stat, idx) => (
              <div key={stat.label} className="stat-item">
                {idx > 0 && <div className="stat-divider" />}
                <div className={`stat-value stat-color-${idx}`}>{stat.value}</div>
                <p className="muted stat-label">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Continue learning card */}
          {recentDecks.length > 0 && (
            <div className="card-base continue-gradient">
              <p className="continue-subtitle">Continue learning</p>
              <h2 className="continue-title">{recentDecks[0]?.title || 'Your flashcards'}</h2>
              <div className="progress-bar" style={{ marginTop: '14px', background: 'rgba(255,255,255,0.25)' }}>
                <div className="progress-fill-white" style={{ width: `${recentDecks[0]?.progress || 0}%` }} />
              </div>
              <button className="btn ghost" style={{ marginTop: '14px', color: '#6a82fb' }} onClick={() => navigate('/flashcards/study')}>
                Resume →
              </button>
            </div>
          )}

          {/* Recent flashcards */}
          {recentDecks.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '10px' }}>Recent flashcards</h3>
              <div className="recent-scroll">
                {recentDecks.map((deck) => (
                  <div key={deck.title || deck._id} className="card-base recent-card">
                    <p className="muted" style={{ fontSize: '11px' }}>{deck.category || 'VOCAB'}</p>
                    <h3>{deck.title}</h3>
                    <p className="muted">{deck.count || 0} cards</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Recommended */}
      <div>
        <h3 style={{ marginBottom: '10px' }}>Recommended for you</h3>
        <div className="col">
          <div className="card-base between">
            <div>
              <p className="muted" style={{ fontSize: '12px' }}>QUIZ · 10 questions</p>
              <h3>Phrasal verbs</h3>
            </div>
            <button className="btn btn-inline" onClick={() => navigate('/quiz')}>Start</button>
          </div>
          <div className="card-base between">
            <div>
              <p className="muted" style={{ fontSize: '12px' }}>CHAT</p>
              <h3>Continue: IELTS Speaking</h3>
            </div>
            <button className="btn ghost btn-inline" onClick={() => navigate('/chat')}>Open</button>
          </div>
          <div className="card-base">
            <p className="muted" style={{ fontSize: '12px' }}>⚠️ WEAK TOPIC</p>
            <h3>Conditional sentences</h3>
            <p className="muted" style={{ marginTop: '4px' }}>Tap to practice 5 quick questions</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default DashboardPage
