import { useEffect, useState } from 'react'
import authService from '../services/auth.service'
import progressService from '../services/progress.service'

export default function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        const [userData, progressData] = await Promise.all([
          authService.getProfile().catch(() => null),
          progressService.getProgress().catch(() => null),
        ])

        const user = userData?.user || userData
        setProfile({
          name: user?.name || 'User',
          level: user?.level || 'Intermediate',
          target: user?.target || 'General English',
          stats: progressData
            ? [
                { label: 'Streak', value: `${progressData.streak ?? 0}d` },
                { label: 'Words', value: String(progressData.wordsLearned ?? 0) },
                { label: 'Accuracy', value: `${progressData.accuracy ?? 0}%` },
              ]
            : [],
          weekly: progressData?.weekly || [],
          skills: progressData?.skills || [],
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return { profile, loading, error }
}
