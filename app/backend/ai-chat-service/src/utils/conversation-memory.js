const conversationRepository = require('../repositories/conversation.repository');
const { normalizeConversationId } = require('./chat-validator');

const MAX_MEMORY_MESSAGES = 10;

async function getConversationHistory(conversationId) {
  return conversationRepository.getRecentMessages(conversationId, MAX_MEMORY_MESSAGES);
}

async function appendConversationMessages(conversationId, messages, options = {}) {
  return conversationRepository.appendMessages(conversationId, messages, options);
}

async function resetConversationMemory(conversationId) {
  return conversationRepository.resetConversations(conversationId);
}

async function getConversationCount() {
  return conversationRepository.countConversations();
}

module.exports = {
  MAX_MEMORY_MESSAGES,
  appendConversationMessages,
  getConversationCount,
  getConversationHistory,
  normalizeConversationId,
  resetConversationMemory,
};
