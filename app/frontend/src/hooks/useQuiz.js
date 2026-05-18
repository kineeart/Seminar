import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import quizService from '../services/quiz.service'

export default function useQuiz() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quizId, setQuizId] = useState(null)

  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true)
        const data = await quizService.generate('mixed', 5)
        setQuestions(data.questions || data || [])
        if (data.quizId || data._id) {
          setQuizId(data.quizId || data._id)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [])

  const current = questions[index]
  const total = questions.length
  const isLast = index === total - 1

  const feedback = useMemo(() => {
    if (selected === null || !current) return null
    const correct = selected === current.correct
    return {
      correct,
      text: correct ? 'Correct answer.' : `Not quite. ${current.explanation || ''}`,
    }
  }, [selected, current])

  const select = (i) => {
    if (feedback) return // already submitted
    setSelected(i)
  }

  const onContinue = useCallback(() => {
    if (selected === null) return
    const nextAnswers = [...answers, selected === current.correct ? 1 : 0]
    setAnswers(nextAnswers)
    setSelected(null)

    if (isLast) {
      // Submit to backend
      if (quizId) {
        quizService.submitQuiz(quizId, nextAnswers).catch(() => {})
      }
      const score = nextAnswers.reduce((sum, v) => sum + v, 0)
      navigate('/quiz/result', {
        state: {
          score,
          total: questions.length,
          weakTopics: questions.filter((_, i) => !nextAnswers[i]).map((q) => q.tag),
        },
      })
      return
    }

    setIndex((prev) => prev + 1)
  }, [selected, answers, current, isLast, quizId, questions, navigate])

  return { current, index, total, selected, feedback, loading, error, select, onContinue, isLast }
}
