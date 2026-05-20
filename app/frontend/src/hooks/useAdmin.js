import { useCallback, useEffect, useState } from 'react'

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
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [flashcards, setFlashcards] = useState([])
  const [flashcardTotal, setFlashcardTotal] = useState(0)
  const [conversations, setConversations] = useState([])
  const [conversationTotal, setConversationTotal] = useState(0)
  const [llmConfig, setLlmConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState(null)

  const checkServices = useCallback(async () => {
    const results = await Promise.all(
      SERVICES.map(async (service) => {
        const start = Date.now()
        try {
          const resp = await fetch(service.healthUrl, { signal: AbortSignal.timeout(5000) })
          const elapsed = Date.now() - start
          if (resp.ok) {
            return { ...service, status: 'online', responseTime: elapsed }
          }
          return { ...service, status: 'error', responseTime: elapsed, error: `HTTP ${resp.status}` }
        } catch (err) {
          return { ...service, status: 'offline', responseTime: Date.now() - start, error: err.message }
        }
      })
    )
    setServices(results)
    setLastChecked(new Date())
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    await checkServices()

    // Fetch admin data
    const [statsRes, usersRes, fcRes, convRes, llmRes] = await Promise.all([
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/users').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/flashcards?limit=20').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/conversations?limit=10').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/llm-config').then(r => r.ok ? r.json() : null).catch(() => null),
    ])

    if (statsRes) setStats(statsRes)
    if (usersRes) setUsers(usersRes.users || [])
    if (fcRes) { setFlashcards(fcRes.flashcards || []); setFlashcardTotal(fcRes.total || 0) }
    if (convRes) { setConversations(convRes.conversations || []); setConversationTotal(convRes.total || 0) }
    if (llmRes) setLlmConfig(llmRes)

    setLoading(false)
  }, [checkServices])

  const deleteFlashcard = useCallback(async (id) => {
    try {
      const resp = await fetch(`/api/admin/flashcards/${id}`, { method: 'DELETE' })
      if (resp.ok) {
        setFlashcards((prev) => prev.filter((fc) => fc._id !== id))
        setFlashcardTotal((t) => t - 1)
      }
    } catch { /* ignore */ }
  }, [])

  const filterFlashcards = useCallback(async (source) => {
    try {
      const url = source ? `/api/admin/flashcards?limit=50&source=${source}` : '/api/admin/flashcards?limit=50'
      const resp = await fetch(url)
      if (resp.ok) {
        const data = await resp.json()
        setFlashcards(data.flashcards || [])
        setFlashcardTotal(data.total || 0)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const onlineCount = services.filter((s) => s.status === 'online').length
  const totalCount = services.length

  return {
    services, stats, users, flashcards, flashcardTotal, conversations, conversationTotal,
    llmConfig, loading, lastChecked, onlineCount, totalCount,
    refresh: fetchData, deleteFlashcard, filterFlashcards,
  }
}
