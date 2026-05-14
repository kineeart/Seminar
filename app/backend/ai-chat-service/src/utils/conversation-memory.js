const MAX_MEMORY_MESSAGES = 10;

const conversations = new Map();

function normalizeConversationId(conversationId) {
  return String(conversationId || 'default').trim() || 'default';
}

function cloneMessage(message) {
  return {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
  };
}

function getConversationHistory(conversationId) {
  const key = normalizeConversationId(conversationId);
  const messages = conversations.get(key) || [];
  return messages.map(cloneMessage);
}

function trimHistory(messages) {
  if (messages.length <= MAX_MEMORY_MESSAGES) {
    return messages;
  }

  return messages.slice(messages.length - MAX_MEMORY_MESSAGES);
}

function appendConversationMessages(conversationId, messages) {
  const key = normalizeConversationId(conversationId);
  const currentMessages = conversations.get(key) || [];
  const nextMessages = currentMessages.concat(
    messages
      .filter((message) => message && typeof message.content === 'string' && message.content.trim())
      .map((message) => ({
        role: message.role,
        content: message.content.trim(),
        timestamp: message.timestamp || new Date().toISOString(),
      })),
  );

  conversations.set(key, trimHistory(nextMessages));
  return getConversationHistory(key);
}

function resetConversationMemory(conversationId) {
  if (conversationId) {
    conversations.delete(normalizeConversationId(conversationId));
    return;
  }

  conversations.clear();
}

function getConversationCount() {
  return conversations.size;
}

module.exports = {
  MAX_MEMORY_MESSAGES,
  appendConversationMessages,
  getConversationCount,
  getConversationHistory,
  normalizeConversationId,
  resetConversationMemory,
};
