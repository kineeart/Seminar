import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import useDashboard from '../hooks/useDashboard'
import { progressService } from '../services'

function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { stats, recentDecks, recommendations, learningAnalysis, loading } = useDashboard()
  const [generatingAIAnalysis, setGeneratingAIAnalysis] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null)
  const [error, setError] = useState(null)

  const displayName = user?.name || 'Learner'
  const initial = displayName.charAt(0).toUpperCase()

  const handleGenerateAIAnalysis = async () => {
    setGeneratingAIAnalysis(true)
    setError(null)
    setAiAnalysisResult(null)
    try {
      const userId = window.localStorage.getItem('userId') || 'guest'
      const data = await progressService.getLearningAnalysis(userId)
      if (data?.analysis) {
        setAiAnalysisResult(data.analysis)
      }
    } catch (err) {
      setError(err.message || 'Failed to generate AI analysis')
    } finally {
      setGeneratingAIAnalysis(false)
    }
  }

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

      {/* AI Recommendation */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>🎓 AI Learning Analysis</h3>
          <Button
            size="sm"
            onClick={handleGenerateAIAnalysis}
            disabled={generatingAIAnalysis}
            variant="primary"
          >
            {generatingAIAnalysis ? 'Generating...' : '✨ Generate AI Analysis'}
          </Button>
        </div>

        {error && (
          <div className="card-base" style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#f44336' }}>
            <p style={{ margin: 0, fontSize: '13px' }}>Error: {error}</p>
          </div>
        )}

        {generatingAIAnalysis ? (
          <div className="card-base">
            <LoadingSpinner text="AI is analyzing your learning progress..." />
          </div>
        ) : aiAnalysisResult ? (
          <div className="col">
            {/* Greeting */}
            <div className="card-base" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{aiAnalysisResult.greeting || '👋 Hello!'}</p>
              <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>{aiAnalysisResult.overallSummary}</p>
            </div>

            {/* Accuracy Analysis */}
            {aiAnalysisResult.accuracyAnalysis && (
              <div className="card-base">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p className="muted" style={{ fontSize: '11px', margin: 0 }}>🎯 ACCURACY ANALYSIS</p>
                  <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(76, 175, 80, 0.2)', borderRadius: '10px', color: '#4caf50' }}>
                    {aiAnalysisResult.accuracyAnalysis.level?.toUpperCase() || 'INTERMEDIATE'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{aiAnalysisResult.accuracyAnalysis.feedback}</p>
                {aiAnalysisResult.accuracyAnalysis.tips && aiAnalysisResult.accuracyAnalysis.tips.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <p className="muted" style={{ fontSize: '11px', margin: '0 0 6px 0' }}>💡 Tips:</p>
                    {aiAnalysisResult.accuracyAnalysis.tips.map((tip, idx) => (
                      <p key={idx} style={{ fontSize: '12px', margin: '4px 0 4px 16px', color: '#666' }}>• {tip}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Streak Analysis */}
            {aiAnalysisResult.streakAnalysis && (
              <div className="card-base">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p className="muted" style={{ fontSize: '11px', margin: 0 }}>🔥 STUDY STREAK</p>
                  <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(255, 152, 0, 0.2)', borderRadius: '10px', color: '#ff9800' }}>
                    {aiAnalysisResult.streakAnalysis.status?.toUpperCase() || 'BUILDING'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{aiAnalysisResult.streakAnalysis.feedback}</p>
                <p style={{ fontSize: '13px', fontWeight: '500', marginTop: '8px', color: '#ff9800' }}>{aiAnalysisResult.streakAnalysis.motivation}</p>
              </div>
            )}

            {/* Vocabulary Insights */}
            {aiAnalysisResult.vocabularyInsights && (
              <div className="card-base">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p className="muted" style={{ fontSize: '11px', margin: 0 }}>📖 VOCABULARY PROGRESS</p>
                  <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(33, 150, 243, 0.2)', borderRadius: '10px', color: '#2196f3' }}>
                    {(aiAnalysisResult.vocabularyInsights.count || 0)} WORDS
                  </span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{aiAnalysisResult.vocabularyInsights.feedback}</p>
                <p style={{ fontSize: '12px', marginTop: '8px', color: '#2196f3' }}>{aiAnalysisResult.vocabularyInsights.recommendation}</p>
              </div>
            )}

            {/* Topic Analysis */}
            {aiAnalysisResult.topicAnalysis && (
              <div className="card-base">
                <p className="muted" style={{ fontSize: '11px', margin: '0 0 8px 0' }}>📊 TOPIC ANALYSIS</p>
                <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{aiAnalysisResult.topicAnalysis.feedback}</p>
                {aiAnalysisResult.topicAnalysis.weakTopics && aiAnalysisResult.topicAnalysis.weakTopics.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <p className="muted" style={{ fontSize: '11px', margin: '0 0 4px 0' }}>Weak areas to focus on:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {aiAnalysisResult.topicAnalysis.weakTopics.map((topic, idx) => (
                        <span key={idx} style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(244, 67, 54, 0.1)', borderRadius: '12px', color: '#f44336' }}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Personal Insights */}
            {aiAnalysisResult.personalInsights && (
              <div className="card-base">
                <p className="muted" style={{ fontSize: '11px', margin: '0 0 8px 0' }}>🧠 PERSONAL LEARNING PROFILE</p>
                <p style={{ fontSize: '13px', margin: '0 0 8px 0' }}><strong>Learning Style:</strong> {aiAnalysisResult.personalInsights.learningStyle}</p>
                {aiAnalysisResult.personalInsights.strengths && aiAnalysisResult.personalInsights.strengths.length > 0 && (
                  <p style={{ fontSize: '12px', margin: '6px 0' }}><strong>Strengths:</strong> {aiAnalysisResult.personalInsights.strengths.join(', ')}</p>
                )}
                {aiAnalysisResult.personalInsights.growthAreas && aiAnalysisResult.personalInsights.growthAreas.length > 0 && (
                  <p style={{ fontSize: '12px', margin: '6px 0' }}><strong>Growth Areas:</strong> {aiAnalysisResult.personalInsights.growthAreas.join(', ')}</p>
                )}
              </div>
            )}

            {/* Priority Actions */}
            {aiAnalysisResult.priorityActions && aiAnalysisResult.priorityActions.length > 0 && (
              <div className="card-base" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
                <p className="muted" style={{ fontSize: '11px', margin: '0 0 10px 0', color: 'rgba(255,255,255,0.9)' }}>⭐ PRIORITY ACTIONS</p>
                {aiAnalysisResult.priorityActions.map((action, idx) => (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 4px 0' }}>{idx + 1}. {action.action}</p>
                    {action.words && action.words.length > 0 && (
                      <p style={{ fontSize: '11px', margin: '0 0 4px 0', opacity: 0.9 }}>Words: {action.words.join(', ')}</p>
                    )}
                    {action.timeMinutes && (
                      <p style={{ fontSize: '11px', margin: 0, opacity: 0.8 }}>⏱️ {action.timeMinutes} min</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Motivational Closing */}
            <div className="card-base" style={{ background: 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)', color: 'white' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{aiAnalysisResult.motivationalClosing}</p>
            </div>

            {/* Start Quiz Button */}
            <Button
              fullWidth
              onClick={() => navigate('/quiz', { state: { topic: aiAnalysisResult.topicAnalysis?.weakTopics?.[0] || 'general' } })}
            >
              Start Quiz on Weak Topic →
            </Button>
          </div>
        ) : (
          <div className="card-base" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
            <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>Ready for a personalized learning analysis?</p>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#666' }}>
              Our AI tutor will analyze your progress and provide detailed feedback on accuracy, vocabulary, study habits, and more.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default DashboardPage
