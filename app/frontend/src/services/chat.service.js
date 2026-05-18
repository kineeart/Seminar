import api from './api'

export const chatService = {
  /**
   * Send a chat message to the AI tutor.
   * Backend expects: { message, level, conversationId, userId }
   * Backend returns: { success, reply }
   */
  sendMessage: (message, conversationId = null, mode = 'knowledge', user = null) => {
    const userId = user?.id || window.localStorage.getItem('userId') || null
    const level = user?.level || 'Intermediate'

    return api.post('/chat', {
      message,
      conversationId: conversationId || undefined,
      userId,
      level,
      mode,
    })
  },

  listConversations: () => api.get('/chat/conversations'),

  getConversation: (conversationId) => api.get(`/chat/conversations/${conversationId}`),
}

export default chatService
