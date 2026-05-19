import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function QuizResultPage() {
  const { state } = useLocation()
  const [showDetails, setShowDetails] = useState(false)
  const score = state?.score ?? 0
  const total = state?.total ?? 0
  const weakTopics = state?.weakTopics ?? []
  const results = state?.results ?? []
  const quiz = state?.quiz ?? null
  const difficulty = state?.difficulty || quiz?.difficulty || ''
  const percent = state?.percent ?? (total > 0 ? Math.round((score / total) * 100) : 0)
  const correctResults = results.filter((result) => result.isCorrect)
  const incorrectResults = results.filter((result) => !result.isCorrect)

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
        <p>See your score now and review each answer only when you need it.</p>
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
        <h2>Summary</h2>
        <p><strong>Correct answers:</strong> {correctResults.length}</p>
        <p><strong>Incorrect answers:</strong> {incorrectResults.length}</p>
        {weakTopics.length > 0 ? (
          <>
            <h3 style={{ marginTop: '12px' }}>Weak topics</h3>
            <div className="filter-chips">
              {weakTopics.map((topic) => <span key={topic} className="filter-chip">{topic}</span>)}
            </div>
          </>
        ) : null}
      </Card>

      <div className="action-row">
        <Button onClick={() => setShowDetails((prev) => !prev)}>
          {showDetails ? 'Hide result details' : 'Check result'}
        </Button>
        <Button to="/quiz?mode=retry" state={quiz ? { quiz, retry: true, difficulty, questionCount: state?.questionCount || total || 10 } : { retry: true, difficulty, questionCount: state?.questionCount || total || 10 }} variant="ghost">Retry this quiz</Button>
      </div>

      {showDetails ? (
        <div className="col" style={{ gap: '12px' }}>
          <Card>
            <h2>Correct answers</h2>
            {correctResults.length > 0 ? (
              <div className="col" style={{ gap: '12px', marginTop: '12px' }}>
                {correctResults.map((result, resultIndex) => (
                  <Card key={result.questionId || `correct-${resultIndex}`} className="card-success">
                    <small>{result.skillTag || 'general'}</small>
                    <h3 style={{ marginTop: '6px' }}>{result.question}</h3>
                    <p style={{ marginTop: '8px' }}><strong>Your answer:</strong> {result.selectedAnswer || 'No answer selected'}</p>
                    {result.explanation ? <p style={{ marginTop: '8px' }}>{result.explanation}</p> : null}
                  </Card>
                ))}
              </div>
            ) : (
              <p style={{ marginTop: '12px' }}>No correct answers in this attempt.</p>
            )}
          </Card>

          <Card>
            <h2>Incorrect answers</h2>
            {incorrectResults.length > 0 ? (
              <div className="col" style={{ gap: '12px', marginTop: '12px' }}>
                {incorrectResults.map((result, resultIndex) => (
                  <Card key={result.questionId || `incorrect-${resultIndex}`} className="card-danger">
                    <small>{result.skillTag || 'general'}</small>
                    <h3 style={{ marginTop: '6px' }}>{result.question}</h3>
                    <p style={{ marginTop: '8px' }}><strong>Your answer:</strong> {result.selectedAnswer || 'No answer selected'}</p>
                    <p><strong>Correct answer:</strong> {result.correctAnswer}</p>
                    {result.explanation ? <p style={{ marginTop: '8px' }}>{result.explanation}</p> : null}
                  </Card>
                ))}
              </div>
            ) : (
              <p style={{ marginTop: '12px' }}>Great job. You answered every question correctly.</p>
            )}
          </Card>
        </div>
      ) : null}

      <div className="action-row">
        <Button variant="ghost" to="/flashcards">Review with flashcards</Button>
        <Button variant="ghost" to="/dashboard">Back to home</Button>
      </div>
    </MainLayout>
  )
}

export default QuizResultPage
