import { useEffect, useState } from 'react'
import progressService from '../services/progress.service'
import flashcardService from '../services/flashcard.service'

export default function useDashboard() {
  const [stats, setStats] = useState(null)
  const [recentDecks, setRecentDecks] = useState([])
  const [recommendations, setRecommendations] = useState({
    review_words: [],
    weak_flashcards: [],
    next_quiz: { topic: 'general', difficulty: 'easy', count: 10 },
  })
  const [learningAnalysis, setLearningAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        const [progressData, flashcardStats, recommendationData, analysisData] = await Promise.all([
          progressService.getProgress().catch(() => null),
          flashcardService.getStats().catch(() => null),
          progressService.getRecommendations().catch(() => null),
          progressService.getLearningAnalysis().catch(() => null),
        ])

        const normalizedProgress = progressData?.progress || progressData
        if (normalizedProgress) {
          setStats([
            { label: 'Day streak', value: String(normalizedProgress.streak_days ?? normalizedProgress.streak ?? 0) },
            { label: 'Words', value: String(normalizedProgress.learned_words_count ?? normalizedProgress.wordsLearned ?? 0) },
            { label: 'Accuracy', value: `${normalizedProgress.quiz_accuracy ?? normalizedProgress.accuracy ?? 0}%` },
          ])
        }

        if (flashcardStats?.recentDecks) {
          setRecentDecks(flashcardStats.recentDecks)
        } else if (flashcardStats?.history) {
          setRecentDecks(flashcardStats.history)
        }

        const normalizedRecommendations = recommendationData?.recommendations || recommendationData
        if (normalizedRecommendations) {
          setRecommendations({
            review_words: normalizedRecommendations.review_words || [],
            weak_flashcards: normalizedRecommendations.weak_flashcards || [],
            next_quiz: normalizedRecommendations.next_quiz || { topic: 'general', difficulty: 'easy', count: 10 },
          })
        }

        if (analysisData?.analysis) {
          setLearningAnalysis(analysisData.analysis)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return { stats, recentDecks, recommendations, learningAnalysis, loading, error }
}
