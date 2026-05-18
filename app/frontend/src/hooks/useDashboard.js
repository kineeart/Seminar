import { useEffect, useState } from 'react'
import progressService from '../services/progress.service'
import flashcardService from '../services/flashcard.service'

export default function useDashboard() {
  const [stats, setStats] = useState(null)
  const [recentDecks, setRecentDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        const [progressData, flashcardStats] = await Promise.all([
          progressService.getProgress().catch(() => null),
          flashcardService.getStats().catch(() => null),
        ])

        if (progressData) {
          setStats([
            { label: 'Day streak', value: String(progressData.streak ?? 0) },
            { label: 'Words', value: String(progressData.wordsLearned ?? 0) },
            { label: 'Accuracy', value: `${progressData.accuracy ?? 0}%` },
          ])
        }

        if (flashcardStats?.recentDecks) {
          setRecentDecks(flashcardStats.recentDecks)
        } else if (flashcardStats?.history) {
          setRecentDecks(flashcardStats.history)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return { stats, recentDecks, loading, error }
}
