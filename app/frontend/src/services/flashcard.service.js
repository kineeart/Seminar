import api from './api'

export const flashcardService = {
  generate: (topic, count = 10) => api.post('/flashcards/generate', { topic, count }),

  getHistory: (userId) => {
    const uid = userId || window.localStorage.getItem('userId')
    const requesterId = window.localStorage.getItem('userId')
    const requesterRole = window.localStorage.getItem('userRole') || 'user'
    console.log('[flashcard.service] getHistory userId:', uid)
    const fetchByUser = (id) => api.get(
      `/flashcards/history?userId=${encodeURIComponent(id)}&requesterId=${encodeURIComponent(requesterId || '')}&requesterRole=${encodeURIComponent(requesterRole)}`,
    )

    if (!uid) {
      return Promise.resolve({ flashcards: [] })
    }

    return fetchByUser(uid)
      .then((data) => {
        const cards = data?.flashcards || []
        if (Array.isArray(cards) && cards.length > 0) {
          return data
        }
        return { flashcards: [] }
      })
      .catch((err) => {
        console.warn('[flashcard.service] getHistory error:', err.message)
        return { flashcards: [] }
      })
  },

  getStats: (userId) => {
    const uid = userId || window.localStorage.getItem('userId')
    const requesterId = window.localStorage.getItem('userId')
    const requesterRole = window.localStorage.getItem('userRole') || 'user'
    if (!uid) return Promise.resolve({ stats: {} })
    return api.get(
      `/flashcards/stats?userId=${encodeURIComponent(uid)}&requesterId=${encodeURIComponent(requesterId || '')}&requesterRole=${encodeURIComponent(requesterRole)}`,
    ).catch(() => ({ stats: {} }))
  },

  markReviewed: (flashcardId, known) => api.post(`/flashcards/${flashcardId}/review`, { known }),
}

export default flashcardService
