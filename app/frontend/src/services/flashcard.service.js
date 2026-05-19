import api from './api'

export const flashcardService = {
  generate: (topic, count = 10) => api.post('/flashcards/generate', { topic, count }),

  getHistory: (userId) => {
    const uid = userId || window.localStorage.getItem('userId')
    console.log('[flashcard.service] getHistory userId:', uid)
    const fetchByUser = (id) => api.get(`/flashcards/history?userId=${encodeURIComponent(id)}`)

    if (!uid) {
      // Fallback for guest sessions where cards were saved without login.
      return fetchByUser('guest').catch(() => ({ flashcards: [] }))
    }

    return fetchByUser(uid)
      .then((data) => {
        const cards = data?.flashcards || []
        if (Array.isArray(cards) && cards.length > 0) {
          return data
        }
        return fetchByUser('guest').catch(() => ({ flashcards: [] }))
      })
      .catch((err) => {
        console.warn('[flashcard.service] getHistory error:', err.message)
        return fetchByUser('guest').catch(() => ({ flashcards: [] }))
      })
  },

  getStats: (userId) => {
    const uid = userId || window.localStorage.getItem('userId')
    if (!uid) return Promise.resolve({ stats: {} })
    return api.get(`/flashcards/stats?userId=${encodeURIComponent(uid)}`).catch(() => ({ stats: {} }))
  },

  markReviewed: (flashcardId, known) => api.post(`/flashcards/${flashcardId}/review`, { known }),
}

export default flashcardService
