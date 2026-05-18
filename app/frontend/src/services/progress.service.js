import api from './api'

export const progressService = {
  getProgress: () => api.get('/progress'),

  recordFlashcardReview: (flashcardId, known) =>
    api.post('/progress/flashcard-review', { flashcardId, known }),

  recordChatActivity: (conversationId, messageCount) =>
    api.post('/progress/chat-activity', { conversationId, messageCount }),
}

export default progressService
