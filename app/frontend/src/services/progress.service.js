import api from './api'

function getUserId(userId) {
  return userId || window.localStorage.getItem('userId') || 'guest'
}

export const progressService = {
  getProgress: (userId) => {
    const uid = getUserId(userId)
    return api.get(`/progress?userId=${encodeURIComponent(uid)}`)
  },

  getRecommendations: (userId) => {
    const uid = getUserId(userId)
    return api.get(`/progress/recommendations?userId=${encodeURIComponent(uid)}`)
  },

  getLearningAnalysis: (userId) => {
    const uid = getUserId(userId)
    return api.get(`/progress/learning-analysis?userId=${encodeURIComponent(uid)}`)
  },

  recordFlashcardReview: (flashcardId, known) =>
    api.post('/progress/flashcard-review', { flashcardId, known }),

  recordChatActivity: (conversationId, messageCount) =>
    api.post('/progress/chat-activity', { conversationId, messageCount }),
}

export default progressService
