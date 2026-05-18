import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function useOnboardingDemo() {
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState(null)
  const [exam, setExam] = useState(null)
  const [goals, setGoals] = useState([])
  const [topics, setTopics] = useState([])

  const levels = ['Beginner', 'Intermediate', 'Advanced']
  const exams = ['TOEIC', 'IELTS', 'VSTEP B1', 'VSTEP B2', 'General English']
  const goalOptions = ['Speaking', 'Vocabulary', 'Grammar', 'Communication', 'Exam prep']
  const topicOptions = ['Travel', 'Business', 'Daily life', 'Study', 'Technology']

  const toggleGoal = (g) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  const toggleTopic = (t) => {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const next = () => setStep((s) => Math.min(4, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))
  const skip = () => {
    setStep(4)
  }

  const navigate = useNavigate()
  const finish = () => {
    navigate('/dashboard')
  }

  return {
    step,
    level,
    levels,
    exam,
    exams,
    goals,
    goalOptions,
    topics,
    topicOptions,
    setExam,
    setLevel,
    toggleGoal,
    toggleTopic,
    next,
    back,
    skip,
    finish,
  }
}

