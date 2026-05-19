import api from './api'

export const chatService = {
  /**
   * Send a chat message to the AI tutor.
   * Backend expects: { message, level, conversationId, userId, mode, scenario }
   * Backend returns: { success, reply, goalProgress? }
   */
  sendMessage: (message, conversationId = null, mode = 'knowledge', user = null, scenario = null) => {
    const userId = user?.id || window.localStorage.getItem('userId') || null
    const level = user?.level || 'Intermediate'

    return api.post('/chat', {
      message,
      conversationId: conversationId || undefined,
      userId,
      level,
      mode,
      scenario: scenario || undefined,
    })
  },

  listConversations: () => api.get('/chat/conversations'),

  getConversation: (conversationId) => api.get(`/chat/conversations/${conversationId}`),
}

export default chatService
