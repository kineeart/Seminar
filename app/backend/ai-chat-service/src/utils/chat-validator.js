const MAX_MESSAGE_LENGTH = 2000;
const ALLOWED_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

function createValidationError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeLevel(inputLevel) {
  if (inputLevel === undefined || inputLevel === null || inputLevel === '') {
    return 'Beginner';
  }

  const value = String(inputLevel).trim();
  const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  if (!ALLOWED_LEVELS.includes(normalized)) {
    throw createValidationError(
      'Invalid level. Use Beginner, Intermediate, or Advanced.',
      'INVALID_LEVEL',
    );
  }

  return normalized;
}

function normalizeConversationId(inputConversationId) {
  if (inputConversationId === undefined || inputConversationId === null) {
    return 'default';
  }

  const value = String(inputConversationId).trim();
  if (!value) {
    return 'default';
  }

  return value.slice(0, 100);
}

function validateChatRequest(body) {
  const payload = body || {};
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';

  if (!message) {
    throw createValidationError('Empty message', 'EMPTY_MESSAGE');
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw createValidationError('Message too long', 'TOO_LONG');
  }

  return {
    message,
    level: normalizeLevel(payload.level),
    conversationId: normalizeConversationId(payload.conversationId),
  };
}

module.exports = {
  ALLOWED_LEVELS,
  MAX_MESSAGE_LENGTH,
  normalizeConversationId,
  normalizeLevel,
  validateChatRequest,
};
