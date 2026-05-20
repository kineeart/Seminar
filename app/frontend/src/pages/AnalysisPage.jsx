import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { progressService } from '../services'

function AnalysisPage() {
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setResult(null)
    try {
      const userId = window.localStorage.getItem('userId') || 'guest'
      const data = await progressService.getLearningAnalysis(userId)
      if (data?.analysis || data?.reply) {
        const parsed = data.analysis || JSON.parse(data.reply)
        setResult(parsed)
      } else {
        setError('No analysis data returned')
      }
    } catch (err) {
      setError(err.message || 'Failed to generate AI analysis')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <MainLayout navActive="home">
      <header style={{ paddingTop: '8px', marginBottom: '16px' }}>
        <p className="muted">AI-Powered</p>
        <h1>🎓 Learning Analysis</h1>
      </header>

      {/* Generate Button */}
      {!result && !generating && (
        <div className="card-base" style={{ textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <h3 style={{ marginBottom: '8px' }}>Ready for a personalized analysis?</h3>
          <p className="muted" style={{ marginBottom: '16px', fontSize: '13px' }}>
            AI will analyze your progress: accuracy, vocabulary, study habits, and give recommendations.
          </p>
          <Button onClick={handleGenerate}>✨ Generate AI Analysis</Button>
        </div>
      )}

      {/* Loading */}
      {generating && (
        <div className="card-base">
          <LoadingSpinner text="AI is analyzing your learning progress..." />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card-base" style={{ background: 'rgba(255, 0, 0, 0.05)', marginBottom: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#e74c3c' }}>⚠️ {error}</p>
          <Button size="sm" variant="ghost" onClick={handleGenerate} style={{ marginTop: '10px' }}>
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="col" style={{ gap: '12px' }}>
          {/* Greeting */}
          <div className="card-base" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{result.greeting || '👋 Hello!'}</p>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>{result.overallSummary}</p>
          </div>

          {/* Accuracy */}
          {result.accuracyAnalysis && (
            <div className="card-base">
              <div className="between" style={{ marginBottom: '8px' }}>
                <p className="muted" style={{ fontSize: '11px', margin: 0 }}>🎯 ACCURACY</p>
                <span className="chip">{result.accuracyAnalysis.level?.toUpperCase() || 'N/A'}</span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{result.accuracyAnalysis.feedback}</p>
              {result.accuracyAnalysis.tips?.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p className="muted" style={{ fontSize: '11px', margin: '0 0 6px' }}>💡 Tips:</p>
                  {result.accuracyAnalysis.tips.map((tip, i) => (
                    <p key={i} style={{ fontSize: '12px', margin: '4px 0 4px 12px', color: '#555' }}>• {tip}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Streak */}
          {result.streakAnalysis && (
            <div className="card-base">
              <div className="between" style={{ marginBottom: '8px' }}>
                <p className="muted" style={{ fontSize: '11px', margin: 0 }}>🔥 STUDY STREAK</p>
                <span className="chip">{result.streakAnalysis.status?.toUpperCase() || 'N/A'}</span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{result.streakAnalysis.feedback}</p>
              <p style={{ fontSize: '13px', fontWeight: 500, marginTop: '8px', color: '#f39c12' }}>{result.streakAnalysis.motivation}</p>
            </div>
          )}

          {/* Vocabulary */}
          {result.vocabularyInsights && (
            <div className="card-base">
              <div className="between" style={{ marginBottom: '8px' }}>
                <p className="muted" style={{ fontSize: '11px', margin: 0 }}>📖 VOCABULARY</p>
                <span className="chip">{result.vocabularyInsights.count || 0} WORDS</span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{result.vocabularyInsights.feedback}</p>
              <p style={{ fontSize: '12px', marginTop: '8px', color: '#2196f3' }}>{result.vocabularyInsights.recommendation}</p>
            </div>
          )}

          {/* Topics */}
          {result.topicAnalysis && (
            <div className="card-base">
              <p className="muted" style={{ fontSize: '11px', margin: '0 0 8px' }}>📊 TOPICS</p>
              <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{result.topicAnalysis.feedback}</p>
              {result.topicAnalysis.weakTopics?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {result.topicAnalysis.weakTopics.map((t, i) => (
                    <span key={i} style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(244,67,54,0.1)', borderRadius: '12px', color: '#f44336' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Priority Actions */}
          {result.priorityActions?.length > 0 && (
            <div className="card-base" style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)', color: '#fff' }}>
              <p style={{ fontSize: '11px', margin: '0 0 10px', opacity: 0.9 }}>⭐ PRIORITY ACTIONS</p>
              {result.priorityActions.map((a, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{i + 1}. {a.action}</p>
                  {a.timeMinutes && <p style={{ fontSize: '11px', margin: '2px 0 0', opacity: 0.8 }}>⏱️ {a.timeMinutes} min</p>}
                </div>
              ))}
            </div>
          )}

          {/* Motivational */}
          {result.motivationalClosing && (
            <div className="card-base" style={{ background: 'linear-gradient(135deg, #fc5c7d, #6a82fb)', color: '#fff' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>{result.motivationalClosing}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="ghost" onClick={handleGenerate} style={{ flex: 1 }}>⟳ Regenerate</Button>
            <Button onClick={() => navigate('/quiz')} style={{ flex: 1 }}>Start Quiz →</Button>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default AnalysisPage
