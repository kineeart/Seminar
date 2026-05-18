import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { questions } from '../data/mockQuiz'

function QuizPage() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])

  const current = questions[index]
  const isLast = index === questions.length - 1

  const feedback = useMemo(() => {
    if (selected === null) return null
    const correct = selected === current.correct
    return {
      correct,
      text: correct ? 'Correct answer.' : `Not quite. ${current.explanation}`,
    }
  }, [selected, current])

  const onContinue = () => {
    if (selected === null) return
    const nextAnswers = [...answers, selected === current.correct ? 1 : 0]
    setAnswers(nextAnswers)
    setSelected(null)

    if (isLast) {
      const score = nextAnswers.reduce((sum, value) => sum + value, 0)
      navigate('/quiz/result', {
        state: {
          score,
          total: questions.length,
          weakTopics: questions
            .filter((_, i) => !nextAnswers[i])
            .map((q) => q.tag),
        },
      })
      return
    }

    setIndex((prev) => prev + 1)
  }

  return (
    <MainLayout navActive="quiz">
      <header className="page-header row-between">
        <div>
          <span className="chip">Quiz mode</span>
          <h1>Quick Practice</h1>
          <p>Question {index + 1} of {questions.length}</p>
        </div>
      </header>

      <Card>
        <small>{current.tag}</small>
        <h2>{current.prompt}</h2>
        <div className="option-grid">
          {current.answers.map((option, optionIndex) => {
            const active = selected === optionIndex
            return (
              <button
                key={option}
                className={active ? 'option-card selected' : 'option-card'}
                onClick={() => setSelected(optionIndex)}
                type="button"
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

