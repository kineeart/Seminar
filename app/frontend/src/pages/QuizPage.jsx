import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import useQuiz from '../hooks/useQuiz'

function QuizPage() {
  const { current, index, total, selected, feedback, loading, error, select, onContinue, isLast } = useQuiz()

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
          <span className="chip">Quiz mode</span>
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
        <Card className={feedback.correct ? 'card-success' : 'card-danger'}>
          <strong>{feedback.correct ? 'Nice work' : 'Keep going'}</strong>
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
