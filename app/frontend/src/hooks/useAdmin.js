import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

const SERVICES = [
  { id: 'gateway', name: 'Gateway', port: 5000, healthUrl: '/health' },
  { id: 'auth', name: 'Auth Service', port: 5001, healthUrl: '/api/auth/health' },
  { id: 'ai-chat', name: 'AI Chat Service', port: 5002, healthUrl: '/api/chat/health' },
  { id: 'flashcard', name: 'Flashcard Service', port: 3003, healthUrl: '/api/flashcards/health' },
  { id: 'content', name: 'Content Service', port: 5003, healthUrl: '/api/content/health' },
  { id: 'quiz', name: 'Quiz Service', port: 5004, healthUrl: '/api/quizzes/health' },
]

export default function useAdmin() {
  const [services, setServices] = useState(
    SERVICES.map((s) => ({ ...s, status: 'checking', responseTime: null, error: null }))
  )
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState(null)

  const checkServices = useCallback(async () => {
    setLoading(true)
    const results = await Promise.all(
      SERVICES.map(async (service) => {
        const start = Date.now()
        try {
          // Use fetch directly to avoid api.js 401 redirect
          const resp = await fetch(service.healthUrl, {
            signal: AbortSignal.timeout(5000),
          })
          const elapsed = Date.now() - start
          if (resp.ok) {
            const data = await resp.json().catch(() => ({}))
            return { ...service, status: 'online', responseTime: elapsed, data }
          }
          return { ...service, status: 'error', responseTime: elapsed, error: `HTTP ${resp.status}` }
        } catch (err) {
          const elapsed = Date.now() - start
          return { ...service, status: 'offline', responseTime: elapsed, error: err.message }
        }
      })
    )
    setServices(results)
    setLastChecked(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    checkServices()
  }, [checkServices])

  const onlineCount = services.filter((s) => s.status === 'online').length
  const totalCount = services.length

  return { services, loading, lastChecked, onlineCount, totalCount, refresh: checkServices }
}
