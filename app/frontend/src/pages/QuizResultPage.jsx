import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function QuizResultPage() {
  const { state } = useLocation()
  const score = state?.score ?? 0
  const total = state?.total ?? 0
  const weakTopics = state?.weakTopics ?? []
  const percent = total > 0 ? Math.round((score / total) * 100) : 0

  const ringStyle = useMemo(
    () => ({
      background: `conic-gradient(var(--brand) ${percent * 3.6}deg, #e4e7f5 0deg)`,
    }),
    [percent],
  )

  return (
    <MainLayout navActive="quiz">
      <header className="page-header">
        <h1>Quiz Result</h1>
        <p>Check your score and what to review next.</p>
      </header>

      <Card className="quiz-result-card">
        <div className="score-ring" style={ringStyle}>
          <div>
            <strong>{percent}%</strong>
            <small>{score}/{total || 1}</small>
          </div>
        </div>
      </Card>

      <Card>
        <h2>Weak topics</h2>
        {weakTopics.length > 0 ? (
          <div className="filter-chips">
            {weakTopics.map((topic) => <span key={topic} className="filter-chip">{topic}</span>)}
          </div>
        ) : (
          <p>No weak topics detected in this attempt.</p>
        )}
      </Card>

      <div className="action-row">
        <Button to="/quiz">Try again</Button>
        <Button variant="ghost" to="/flashcards">Review with flashcards</Button>
      </div>
    </MainLayout>
  )
}

export default QuizResultPage

