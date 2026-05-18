import api from './api'

export const flashcardService = {
  generate: (topic, count = 10) => api.post('/flashcards/generate', { topic, count }),

  getHistory: () => api.get('/flashcards/history'),

  getStats: () => api.get('/flashcards/stats'),

  markReviewed: (flashcardId, known) => api.post(`/flashcards/${flashcardId}/review`, { known }),
}

export default flashcardService
