import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import quizService from '../services/quiz.service'
import flashcardService from '../services/flashcard.service'

function mapQuestion(question) {
  return {
    id: question.question_id || question.id,
    type: question.type,
    prompt: question.question || question.prompt,
    options: Array.isArray(question.options) && question.options.length
      ? question.options
      : [question.correct_answer].filter(Boolean),
    explanation: question.explanation || '',
    tag: question.skill_tag || question.tag || 'general',
    difficulty: question.difficulty || 'easy',
  }
}

export default function useQuiz() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state || {}

  // Setup state (selected by user on QuizPage)
  const [difficulty, setDifficulty] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [topic, setTopic] = useState('mixed')
  const [topics, setTopics] = useState(['mixed'])

  // Quiz runtime state
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [quizId, setQuizId] = useState(null)
  const [userId, setUserId] = useState(null)

  // History state
  const [attempts, setAttempts] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)

  const storedUserId = useMemo(() => {
    return window.localStorage.getItem('userId') || 'guest'
  }, [])

  // Load attempts when userId changes (used on QuizPage level selection)
  const loadAttempts = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const data = await quizService.listAttempts(storedUserId, 10)
      setAttempts(data)
    } catch (err) {
      setHistoryError(err.message || 'Failed to load quiz history')
      setAttempts([])
    } finally {
      setHistoryLoading(false)
    }
  }, [storedUserId])

  const retryFromHistory = useCallback(async (attempt) => {
    const retryQuizId = attempt?.quiz_id
    if (!retryQuizId) return

    setLoading(true)
    setError(null)
    setIndex(0)
    setSelected(null)
    setAnswers([])
    setQuestions([])
    setUserId(storedUserId)

    try {
      const quiz = await quizService.getQuiz(retryQuizId)
      const mappedQuestions = (quiz.questions || []).map(mapQuestion)
      setQuizId(quiz.id)
      setDifficulty(quiz.difficulty || 'easy')
      setQuestionCount(mappedQuestions.length || 10)
      setTopic(quiz.generated_from?.topic || 'mixed')
      setQuestions(mappedQuestions)
    } catch (err) {
      setError(err.message || 'Failed to load quiz from history')
    } finally {
      setLoading(false)
    }
  }, [storedUserId])

  // Start quiz with selected difficulty and count
  const startQuiz = useCallback(async (opts = {}) => {
    const diff = opts.difficulty || difficulty || 'easy'
    const count = opts.questionCount || questionCount || 10
    const selectedTopic = opts.topic || topic || 'mixed'

    console.log('[useQuiz] startQuiz called', { diff, count, topic: selectedTopic, storedUserId })
    setLoading(true)
    setError(null)
    setIndex(0)
    setSelected(null)
    setAnswers([])
    setQuestions([])

    setUserId(storedUserId)

    try {
      console.log('[useQuiz] calling quizService.generate')
      const quiz = await quizService.generate({
        topic: selectedTopic,
        count,
        difficulty: diff,
        userId: storedUserId,
        useAi: true,
        source: 'ai',
      })

      console.log('[useQuiz] quiz received', { quizId: quiz?.id, questionCount: quiz?.questions?.length })
      setQuizId(quiz.id)
      const mappedQuestions = (quiz.questions || []).map(mapQuestion)
      console.log('[useQuiz] mapped questions', mappedQuestions.length)
      setQuestions(mappedQuestions)
      return { success: true, quizId: quiz.id, questionCount: quiz.questions?.length || count }
    } catch (err) {
      console.error('[useQuiz] generate error', err)
      setError(err.message || 'Failed to generate quiz')
      return { success: false, error: err.message || 'Failed to generate quiz' }
    } finally {
      setLoading(false)
    }
  }, [difficulty, questionCount, topic, storedUserId])

  // For backward compatibility / retry flow
  const autoStart = useCallback(async () => {
    if (locationState.retry && locationState.quiz?.id && Array.isArray(locationState.quiz?.questions)) {
      setDifficulty(locationState.difficulty || 'easy')
      setQuestionCount(locationState.questionCount || locationState.quiz.questions.length || 10)
      setQuizId(locationState.quiz.id)
      setQuestions(locationState.quiz.questions.map(mapQuestion))
      setUserId(storedUserId)
      setLoading(false)
      setError(null)
      setIndex(0)
      setSelected(null)
      setAnswers([])
      return
    }

    const shouldAutoStart = Boolean(locationState.difficulty || locationState.topic)
    if (!shouldAutoStart) {
      setLoading(false)
      return
    }
    setDifficulty(locationState.difficulty || 'easy')
    setTopic(locationState.topic || 'mixed')
    const count = locationState.questionCount || 10
    setQuestionCount(count)
    await startQuiz({ difficulty: locationState.difficulty, questionCount: count, topic: locationState.topic || 'mixed' })
  }, [locationState, startQuiz, storedUserId])

  useEffect(() => {
    if (locationState.retry) {
      autoStart()
    }
  }, [locationState.retry, autoStart])

  useEffect(() => {
    let cancelled = false
    async function loadTopics() {
      try {
        const data = await flashcardService.getHistory(storedUserId)
        if (cancelled) return
        const cards = Array.isArray(data?.flashcards) ? data.flashcards : []
        const dynamicTopics = Array.from(
          new Set(
            cards.map((card) => {
              const raw = String(card?.topic || '').trim()
              if (!raw || raw.toLowerCase() === 'general') return 'none'
              return raw
            }),
          ),
        )
        const finalTopics = ['mixed', ...dynamicTopics]
        setTopics(finalTopics)
        if (!finalTopics.includes(topic)) {
          setTopic('mixed')
        }
      } catch (_err) {
        if (!cancelled) setTopics(['mixed'])
      }
    }
    loadTopics()
    return () => { cancelled = true }
  }, [storedUserId, topic, setTopic])

  const current = questions[index] || null
  const total = questions.length
  const isLast = total > 0 && index === total - 1

  const feedback = useMemo(() => {
    if (selected === null || !current) return null
    return {
      correct: null,
      text: 'Answer selected. Submit the quiz to review correct and incorrect answers.',
    }
  }, [selected, current])

  const select = (optionIndex) => {
    setSelected(optionIndex)
  }

  const onContinue = useCallback(async () => {
    if (selected === null || !current) return

    const selectedAnswer = current.options[selected]
    const nextAnswers = [
      ...answers,
      {
        questionId: current.id,
        selectedAnswer,
        skillTag: current.tag,
        question: current.prompt,
        options: current.options,
      },
    ]

    setAnswers(nextAnswers)
    setSelected(null)

    if (!isLast) {
      setIndex((prev) => prev + 1)
      return
    }

    try {
      const result = await quizService.submitQuiz(
        quizId,
        nextAnswers.map((answer) => ({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
        })),
        userId,
      )

      const detailedResults = (result.results || []).map((item) => {
        const question = nextAnswers.find((answer) => answer.questionId === item.question_id)
        return {
          questionId: item.question_id,
          question: question?.question || 'Question',
          options: question?.options || [],
          selectedAnswer: item.selected_answer,
          correctAnswer: item.correct_answer,
          isCorrect: Boolean(item.is_correct),
          explanation: item.explanation || '',
          skillTag: question?.skillTag || 'general',
        }
      })

      navigate('/quiz/result', {
        state: {
          score: result.correct_count,
          total: result.total_questions,
          percent: result.score,
          weakTopics: result.weak_topics || [],
          results: detailedResults,
          difficulty,
          questionCount: total,
          quiz: {
            id: quizId,
            questions: questions.map((question) => ({
              id: question.id,
              type: question.type,
              question: question.prompt,
              options: question.options,
              explanation: question.explanation,
              skill_tag: question.tag,
              difficulty: question.difficulty,
            })),
          },
        },
      })
    } catch (err) {
      setError(err.message || 'Failed to submit quiz')
    }
  }, [selected, current, answers, isLast, quizId, navigate, userId, questions, difficulty, total])

  // Reset setup state when navigating to a new mode
  useEffect(() => {
    if (locationState.fresh) {
      setDifficulty('')
      setQuestionCount(10)
      setTopic('mixed')
    }
  }, [locationState.fresh])

  return {
    // Runtime
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
    // Setup (for QuizPage level selection UI)
    difficulty,
    questionCount,
    topic,
    topics,
    setDifficulty,
    setQuestionCount,
    setTopic,
    startQuiz,
    // History
    attempts,
    historyLoading,
    historyError,
    loadAttempts,
    retryFromHistory,
    // Helpers
    userId: userId || storedUserId,
    autoStart,
  }
}
