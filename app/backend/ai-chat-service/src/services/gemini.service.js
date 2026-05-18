const { GoogleGenerativeAI } = require('@google/generative-ai');

const { validateChatRequest, normalizeLevel } = require('../utils/chat-validator');
const { appendConversationMessages, getConversationHistory } = require('../utils/conversation-memory');
const { SYSTEM_PROMPT, buildTutorPrompt } = require('../utils/prompt-builder');
const progressClient = require('../utils/progress-client');

const MAX_INPUT_LENGTH = 2000;
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MODEL_NAME = 'gemini-2.5-flash';
const MAX_RETRY_ATTEMPTS = 2;
const BASE_BACKOFF_MS = 500;
const COOLDOWN_ON_QUOTA_MS = 10000;

let cachedModel = null;
let cooldownUntil = 0;

function getModelName() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL_NAME;
}

function createModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: getModelName(),
    systemInstruction: SYSTEM_PROMPT,
  });
}

function getModel() {
  if (cachedModel !== null) {
    return cachedModel;
  }

  cachedModel = createModel();
  return cachedModel;
}

function withTimeout(promise, timeoutMs) {
  let timeoutId;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, timeoutMs);
    }),
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getUpstreamErrorInfo(error) {
  return {
    status: typeof error?.status === 'number' ? error.status : null,
    statusText: error?.statusText || null,
    details: error?.errorDetails || null,
    message: error?.message || 'Unknown Gemini error',
  };
}

function isRetryableUpstreamError(errorInfo) {
  return [429, 500, 503, 504].includes(errorInfo.status);
}

function getCooldownRemainingMs() {
  return Math.max(0, cooldownUntil - Date.now());
}

function buildFallbackReply(message, level) {
  const learnerLevel = normalizeLevel(level);
  const lowerMessage = message.toLowerCase();
  const beginnerLead = learnerLevel === 'Beginner'
    ? 'Here is a simple explanation:'
    : 'Here is a clear explanation:';

  if (lowerMessage.includes('present perfect')) {
    return `${beginnerLead} present perfect uses have/has + past participle to connect the past with now. Example: I have studied English for three years.`;
  }

  if (lowerMessage.includes('grammar')) {
    return `${beginnerLead} break the sentence into subject, verb, and object, then check tense and agreement. Example: She studies English every day.`;
  }

  if (lowerMessage.includes('vocabulary')) {
    return `${beginnerLead} learn words in small chunks with one example sentence. Example: improve means to get better.`;
  }

  if (learnerLevel === 'Advanced') {
    return 'I am here to help with English learning. Ask a specific grammar, vocabulary, or writing question and I will answer concisely.';
  }

  return 'I am here to help with English learning. Ask me about grammar, vocabulary, conversation, writing, or pronunciation with a specific example.';
}

function logEvent(event, payload) {
  // eslint-disable-next-line no-console
  console.info(JSON.stringify({ event, ...payload }));
}

function logWarning(event, payload) {
  // eslint-disable-next-line no-console
  console.warn(JSON.stringify({ event, ...payload }));
}

async function executeGeminiRequest({
  model,
  prompt,
  message,
  level,
  conversationId,
  requestStartedAt,
  timeoutMs,
  retryAttempts,
  historyCount,
  retryDelayMs,
  attempt = 0,
}) {
  const attemptStartedAt = Date.now();
  const modelName = getModelName();

  logEvent('gemini_request_start', {
    model: modelName,
    level,
    conversationId,
    attempt: attempt + 1,
    promptLength: prompt.length,
    historyCount,
  });

  try {
    const result = await withTimeout(model.generateContent(prompt), timeoutMs);
    const response = result && result.response;
    const text = response && typeof response.text === 'function' ? response.text() : '';
    const reply = String(text || '').trim();

    logEvent('gemini_request_success', {
      model: modelName,
      level,
      conversationId,
      attempt: attempt + 1,
      durationMs: Date.now() - attemptStartedAt,
      totalDurationMs: Date.now() - requestStartedAt,
      responseLength: reply.length,
    });

    return {
      reply: reply || buildFallbackReply(message, level),
      source: 'gemini',
      model: modelName,
      attempts: attempt + 1,
      fallbackReason: null,
      fallbackStatus: null,
    };
  } catch (error) {
    const errorInfo = getUpstreamErrorInfo(error);

    logWarning('gemini_request_failure', {
      model: modelName,
      level,
      conversationId,
      attempt: attempt + 1,
      durationMs: Date.now() - attemptStartedAt,
      totalDurationMs: Date.now() - requestStartedAt,
      status: errorInfo.status,
      statusText: errorInfo.statusText,
      message: errorInfo.message,
      details: errorInfo.details,
    });

    if (errorInfo.status === 429) {
      const backoffMs = Math.max(
        COOLDOWN_ON_QUOTA_MS,
        (retryDelayMs || BASE_BACKOFF_MS) * (2 ** attempt),
      );

      cooldownUntil = Date.now() + backoffMs;

      logWarning('gemini_cooldown_set', {
        model: modelName,
        level,
        conversationId,
        cooldownMs: backoffMs,
        cooldownUntil,
      });
    }

    const shouldRetry = attempt < retryAttempts && isRetryableUpstreamError(errorInfo);
    if (shouldRetry) {
      const backoffMs = Math.min(
        5000,
        (retryDelayMs || BASE_BACKOFF_MS) * (2 ** attempt),
      );

      logEvent('gemini_retry_scheduled', {
        model: modelName,
        level,
        conversationId,
        attempt: attempt + 1,
        backoffMs,
      });

      await sleep(backoffMs);
      return executeGeminiRequest({
        model,
        prompt,
        message,
        level,
        conversationId,
        requestStartedAt,
        timeoutMs,
        retryAttempts,
        historyCount,
        retryDelayMs,
        attempt: attempt + 1,
      });
    }

    return {
      reply: buildFallbackReply(message, level),
      source: 'fallback',
      model: modelName,
      attempts: attempt + 1,
      fallbackReason: errorInfo.message,
      fallbackStatus: errorInfo.status,
    };
  }
}

async function persistConversationActivity(conversationId, userId, level, message, reply) {
  await appendConversationMessages(
    conversationId,
    [
      { role: 'user', content: message },
      { role: 'assistant', content: reply },
    ],
    { userId, level },
  );

  if (userId) {
    try {
      await progressClient.recordChatActivity({
        userId,
        messageCount: 1,
        activityAt: new Date().toISOString(),
      });
    } catch (error) {
      logWarning('progress_chat_activity_failure', {
        userId,
        conversationId,
        message: error.message,
      });
    }
  }
}

async function generateResponse(rawInput, options = {}) {
  const request = typeof rawInput === 'string' ? { message: rawInput } : rawInput || {};
  const {
    message,
    level,
    conversationId,
    userId,
  } = validateChatRequest(request);

  if (message.length > MAX_INPUT_LENGTH) {
    const error = new Error('Message too long');
    error.code = 'TOO_LONG';
    throw error;
  }

  const model = getModel();
  const history = await getConversationHistory(conversationId);
  const prompt = buildTutorPrompt({
    message,
    level,
    history,
  });

  if (!model) {
    const reply = buildFallbackReply(message, level);
    await persistConversationActivity(conversationId, userId, level, message, reply);
    return reply;
  }

  const initialCooldownRemaining = getCooldownRemainingMs();
  if (initialCooldownRemaining > 0) {
    logWarning('gemini_cooldown_active', {
      model: getModelName(),
      level,
      conversationId,
      cooldownRemainingMs: initialCooldownRemaining,
      historyCount: history.length,
    });

    const reply = buildFallbackReply(message, level);
    await persistConversationActivity(conversationId, userId, level, message, reply);
    return reply;
  }

  const requestStartedAt = Date.now();
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const retryAttempts = Number.isInteger(options.retryAttempts)
    ? options.retryAttempts
    : MAX_RETRY_ATTEMPTS;
  const retryDelayMs = Number.isInteger(options.retryDelayMs)
    ? options.retryDelayMs
    : BASE_BACKOFF_MS;

  try {
    const execution = await executeGeminiRequest({
      model,
      prompt,
      message,
      level,
      conversationId,
      requestStartedAt,
      timeoutMs,
      retryAttempts,
      historyCount: history.length,
      retryDelayMs,
    });

    if (execution.source === 'fallback') {
      logWarning('gemini_fallback_reply', {
        model: execution.model,
        level,
        conversationId,
        attempts: execution.attempts,
        status: execution.fallbackStatus || null,
        reason: execution.fallbackReason || 'Gemini unavailable',
      });
    }

    await persistConversationActivity(conversationId, userId, level, message, execution.reply);

    return execution.reply;
  } catch (error) {
    const errorMessage = error?.message || '';
    // Defensive only; the main flow already returns fallback on upstream failure.
    // eslint-disable-next-line no-console
    console.warn('Gemini request failed unexpectedly; using fallback reply.', errorMessage);

    const reply = buildFallbackReply(message, level);
    await persistConversationActivity(conversationId, userId, level, message, reply);

    return reply;
  }
}

module.exports = {
  generateResponse,
  _getModel: getModel,
  _createModel: createModel,
};
