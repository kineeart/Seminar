import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/mockQuiz'

export default function useQuizDemo() {
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState([])

  const current = questions[qIndex]
  const total = questions.length
  const navigate = useNavigate()

  const select = (i) => {
    if (submitted) return
    setSelected(i)
  }

  const submit = () => {
    if (selected === null) return
    setSubmitted(true)
    setAnswers((prev) => [...prev, { qId: current.id, answer: selected, correct: current.correct }])
  }

  const next = () => {
    if (qIndex + 1 < total) {
      setQIndex((i) => i + 1)
      setSelected(null)
      setSubmitted(false)
    } else {
      navigate('/quiz/result')
    }
  }

  const retry = () => {
    setQIndex(0)
    setSelected(null)
    setSubmitted(false)
    setAnswers([])
  }

  return { current, qIndex, total, selected, submitted, answers, select, submit, next, retry }
}