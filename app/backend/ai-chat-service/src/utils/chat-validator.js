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
  const createConversationId = () =>
    `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (inputConversationId === undefined || inputConversationId === null) {
    return createConversationId();
  }

  const value = String(inputConversationId).trim();
  if (!value) {
    return createConversationId();
  }

  return value.slice(0, 100);
}

function normalizeUserId(inputUserId) {
  if (inputUserId === undefined || inputUserId === null) {
    return null;
  }

  const value = String(inputUserId).trim();
  if (!value) {
    return null;
  }

  return value.slice(0, 120);
}

function validateChatRequest(body) {
  const payload = body || {};
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const mode = typeof payload.mode === 'string' ? payload.mode.trim().toLowerCase() : 'knowledge';
  const scenario = typeof payload.scenario === 'string' ? payload.scenario.trim() : '';

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
    userId: normalizeUserId(payload.userId),
    mode: mode === 'roleplay' ? 'roleplay' : 'knowledge',
    scenario: scenario.slice(0, 120),
  };
}

module.exports = {
  ALLOWED_LEVELS,
  MAX_MESSAGE_LENGTH,
  normalizeConversationId,
  normalizeUserId,
  normalizeLevel,
  validateChatRequest,
};
