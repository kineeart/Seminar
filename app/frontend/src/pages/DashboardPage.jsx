import { useEffect, useMemo, useState } from 'react'
import '../styles/dashboard.css'

const API_BASE = '/api'
const DEFAULT_GOAL = 20

function getUserId() {
  const stored = window.localStorage.getItem('userId')
  return stored && stored.trim() ? stored.trim() : 'guest'
}

function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardPage() {
  const userId = useMemo(() => getUserId(), [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [flashcardStats, setFlashcardStats] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    let isActive = true

    async function fetchJson(path) {
      const res = await fetch(`${API_BASE}${path}`)
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }
      return res.json()
    }

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const results = await Promise.allSettled([
          fetchJson(`/quizzes/progress?userId=${encodeURIComponent(userId)}`),
          fetchJson(`/quizzes/attempts?userId=${encodeURIComponent(userId)}&limit=5`),
          fetchJson(`/flashcards/history?userId=${encodeURIComponent(userId)}&limit=6`),
          fetchJson(`/flashcards/stats?userId=${encodeURIComponent(userId)}`),
          fetchJson(`/chat/conversations?userId=${encodeURIComponent(userId)}&limit=5`),
        ])

        if (!isActive) return

        const [progressRes, attemptsRes, historyRes, statsRes, conversationsRes] = results

        if (progressRes.status === 'fulfilled') {
          setProgress(progressRes.value.progress)
        }
        if (attemptsRes.status === 'fulfilled') {
          setAttempts(attemptsRes.value.attempts || [])
        }
        if (historyRes.status === 'fulfilled') {
          setFlashcards(historyRes.value.flashcards || [])
        }
        if (statsRes.status === 'fulfilled') {
          setFlashcardStats(statsRes.value.stats)
        }
        if (conversationsRes.status === 'fulfilled') {
          setConversations(conversationsRes.value.conversations || [])
        }
      } catch (err) {
        if (isActive) {
          setError(err.message)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isActive = false
    }
  }, [userId])

  const streak = progress?.streak_days ?? 0
  const quizAccuracy = progress?.quiz_accuracy ?? 0
  const quizzesCompleted = progress?.quizzes_completed ?? 0
  const vocabReviewed = flashcardStats?.reviewed ?? flashcardStats?.total ?? 0
  const progressTotal = quizzesCompleted + vocabReviewed
  const progressPercent = Math.min(100, Math.round((progressTotal / DEFAULT_GOAL) * 100))

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-hero">
          <div>
            <p className="hero-label">Learning Dashboard</p>
            <h1 className="hero-title">
              Stay consistent, learn faster.
            </h1>
            <p className="hero-subtitle">
              Track daily streaks, recent sessions, and your vocabulary momentum in one place.
            </p>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-label">Today</span>
            <span className="hero-stat-value">{formatDate(new Date())}</span>
          </div>
        </header>

        {error && (
          <div className="banner error">{error}</div>
        )}

        <section className="metrics-grid">
          <div className="metric-card">
            <p className="metric-label">Streak</p>
            <h3 className="metric-value">{streak} days</h3>
            <p className="metric-meta">Keep a daily touchpoint to extend it.</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Learning Progress</p>
            <h3 className="metric-value">{progressPercent}%</h3>
            <div className="metric-bar">
              <div className="metric-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="metric-meta">{progressTotal} activities logged</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Vocabulary Reviewed</p>
            <h3 className="metric-value">{vocabReviewed}</h3>
            <p className="metric-meta">Flashcards saved across sessions.</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Quiz Accuracy</p>
            <h3 className="metric-value">{quizAccuracy}%</h3>
            <p className="metric-meta">Based on completed quizzes.</p>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <h2>Recent Conversations</h2>
              <span>{conversations.length} sessions</span>
            </div>
            <ul className="panel-list">
              {loading && <li className="panel-empty">Loading conversations...</li>}
              {!loading && conversations.length === 0 && (
                <li className="panel-empty">No conversations yet.</li>
              )}
              {conversations.map((conversation) => (
                <li key={conversation.id} className="panel-item">
                  <div>
                    <p className="panel-title">{conversation.last_message || 'New conversation'}</p>
                    <p className="panel-meta">Updated {formatDate(conversation.updated_at)}</p>
                  </div>
                  <span className="pill">{conversation.level || 'Beginner'}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Flashcard History</h2>
              <span>{flashcards.length} cards</span>
            </div>
            <ul className="panel-list">
              {loading && <li className="panel-empty">Loading flashcards...</li>}
              {!loading && flashcards.length === 0 && (
                <li className="panel-empty">No flashcards saved yet.</li>
              )}
              {flashcards.map((card) => (
                <li key={card.id || card.word} className="panel-item">
                  <div>
                    <p className="panel-title">{card.word}</p>
                    <p className="panel-meta">{card.meaning}</p>
                  </div>
                  <span className="pill">{formatDate(card.created_at)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Quiz History</h2>
              <span>{attempts.length} attempts</span>
            </div>
            <ul className="panel-list">
              {loading && <li className="panel-empty">Loading quiz history...</li>}
              {!loading && attempts.length === 0 && (
                <li className="panel-empty">No quiz attempts yet.</li>
              )}
              {attempts.map((attempt) => (
                <li key={attempt.id} className="panel-item">
                  <div>
                    <p className="panel-title">Score: {attempt.score}%</p>
                    <p className="panel-meta">{attempt.total_questions} questions</p>
                  </div>
                  <span className="pill">{formatDate(attempt.completed_at)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}
