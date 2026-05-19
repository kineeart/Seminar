import { useEffect, useMemo } from 'react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import useQuiz from '../hooks/useQuiz'

function formatAttemptDate(value) {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleString()
}

function QuizPage() {
  const {
    current,
    index,
    total,
    selected,
    feedback,
    loading,
    error,
    select,
    onContinue,
    isLast,
    difficulty,
    questionCount,
    setDifficulty,
    setQuestionCount,
    startQuiz,
    attempts,
    historyLoading,
    historyError,
    loadAttempts,
  } = useQuiz()

  useEffect(() => {
    loadAttempts()
  }, [loadAttempts])

  const difficultyLabel = useMemo(() => {
    if (difficulty === 'easy') return 'Easy'
    if (difficulty === 'medium') return 'Medium'
    if (difficulty === 'hard') return 'Hard'
    return ''
  }, [difficulty])

  const hasStarted = Boolean(current)

  if (!hasStarted && !loading) {
    return (
      <MainLayout navActive="quiz">
        <header className="page-header">
          <h1>Choose your quiz level</h1>
          <p>Select a difficulty, choose how many questions you want, then start your quiz.</p>
        </header>

        <Card>
          <div className="col" style={{ gap: '16px' }}>
            <div>
              <h2 style={{ marginBottom: '12px' }}>Difficulty</h2>
              <div className="col" style={{ gap: '12px' }}>
                <Button variant={difficulty === 'easy' ? 'primary' : 'ghost'} onClick={() => setDifficulty('easy')}>Easy</Button>
                <Button variant={difficulty === 'medium' ? 'primary' : 'ghost'} onClick={() => setDifficulty('medium')}>Medium</Button>
                <Button variant={difficulty === 'hard' ? 'primary' : 'ghost'} onClick={() => setDifficulty('hard')}>Hard</Button>
              </div>
            </div>

            <div>
              <h2 style={{ marginBottom: '12px' }}>Question count</h2>
              <div className="action-row">
                {[10, 15, 20].map((count) => (
                  <Button
                    key={count}
                    variant={questionCount === count ? 'primary' : 'ghost'}
                    onClick={() => setQuestionCount(count)}
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            <div className="action-row">
              <Button variant="ghost" to="/dashboard">Back to home</Button>
              <Button onClick={() => startQuiz()} disabled={!difficulty}>Start quiz</Button>
            </div>

            {error ? <p>{error}</p> : null}
          </div>
        </Card>

        <Card>
          <h2>Quiz history</h2>
          {historyLoading ? <p>Loading quiz history...</p> : null}
          {historyError ? <p>{historyError}</p> : null}
          {!historyLoading && !historyError && attempts.length === 0 ? (
            <p>You have not completed any quizzes yet.</p>
          ) : null}
          {!historyLoading && !historyError && attempts.length > 0 ? (
            <div className="col" style={{ gap: '12px', marginTop: '12px' }}>
              {attempts.map((attempt) => (
                <Card key={attempt.id || `${attempt.quiz_id}-${attempt.created_at}`}>
                  <div className="row-between" style={{ gap: '12px', alignItems: 'flex-start' }}>
                    <div>
                      <strong>{attempt.correct_count || 0}/{attempt.total_questions || 0}</strong>
                      <p style={{ marginTop: '6px' }}>Score: {attempt.score || 0}%</p>
                      <p style={{ marginTop: '6px' }}>Completed: {formatAttemptDate(attempt.completed_at || attempt.created_at)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <small>Quiz ID</small>
                      <p>{attempt.quiz_id || 'Unknown'}</p>
                    </div>
                  </div>
                  {Array.isArray(attempt.weak_topics) && attempt.weak_topics.length > 0 ? (
                    <div className="filter-chips" style={{ marginTop: '12px' }}>
                      {attempt.weak_topics.map((topic) => (
                        <span key={`${attempt.id || attempt.quiz_id}-${topic}`} className="filter-chip">{topic}</span>
                      ))}
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          ) : null}
        </Card>
      </MainLayout>
    )
  }

  if (loading) {
    return (
      <MainLayout navActive="quiz">
        <LoadingSpinner text="Generating quiz..." />
      </MainLayout>
    )
  }

  if (error || !current) {
    return (
      <MainLayout navActive="quiz">
        <Card>
          <p>{error || 'No questions available. Please try again.'}</p>
          <Button to="/dashboard">Back to home</Button>
        </Card>
      </MainLayout>
    )
  }

  return (
    <MainLayout navActive="quiz">
      <header className="page-header row-between">
        <div>
          <span className="chip">{difficultyLabel || 'Quiz mode'}</span>
          <h1>Quick Practice</h1>
          <p>Question {index + 1} of {total}</p>
        </div>
      </header>

      <Card>
        <small>{current.tag}</small>
        <h2>{current.prompt}</h2>
        <div className="option-grid">
          {(current.answers || current.options || []).map((option, optionIndex) => {
            const active = selected === optionIndex
            const onKeyDown = (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                select(optionIndex)
              }
            }
            return (
              <button
                key={option}
                className={active ? 'option-card selected' : 'option-card'}
                onClick={() => select(optionIndex)}
                onKeyDown={onKeyDown}
                type="button"
                role="button"
                tabIndex={0}
                aria-pressed={active}
              >
                <strong>{option}</strong>
              </button>
            )
          })}
        </div>
      </Card>

      {feedback ? (
        <Card className={feedback.correct === true ? 'card-success' : feedback.correct === false ? 'card-danger' : ''}>
          <strong>
            {feedback.correct === true ? 'Nice work' : feedback.correct === false ? 'Keep going' : 'Answer saved'}
          </strong>
          <p>{feedback.text}</p>
        </Card>
      ) : null}

      <div className="action-row">
        <Button variant="ghost" to="/dashboard">Exit</Button>
        <Button onClick={onContinue}>{isLast ? 'Finish quiz' : 'Next question'}</Button>
      </div>
    </MainLayout>
  )
}

export default QuizPage
