const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = [
  'You are an AI English Tutor helping university students learn English.',
  '',
  'Your teaching style:',
  '* friendly',
  '* concise',
  '* educational',
  '* easy to understand',
  '* supportive',
  '',
  'You help with:',
  '* grammar',
  '* vocabulary',
  '* conversation',
  '* writing',
  '* pronunciation explanations',
].join('\n');

const MAX_INPUT_LENGTH = 2000;
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MODEL_NAME = 'gemini-2.5-flash';
const MAX_RETRY_ATTEMPTS = 2;
const BASE_BACKOFF_MS = 500;
const COOLDOWN_ON_QUOTA_MS = 60000;

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
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out'));
      }, timeoutMs);
    }),
  ]);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRequestContext(message) {
  return {
    model: getModelName(),
    promptLength: message.length,
  };
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

function buildFallbackReply(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('present perfect')) {
    return 'Present perfect uses have/has + past participle to connect a past action with the present. Example: I have studied English for three years.';
  }

  if (lowerMessage.includes('grammar')) {
    return 'Grammar tip: break the sentence into subject, verb, and object, then check tense and agreement. Example: She studies English every day.';
  }

  if (lowerMessage.includes('vocabulary')) {
    return 'Vocabulary tip: learn words in short chunks with an example sentence. Example: improve — I want to improve my speaking skills.';
  }

  return 'I am here to help with English learning. Ask me about grammar, vocabulary, conversation, writing, or pronunciation with a specific example.';
}

async function executeGeminiRequest({
  model,
  message,
  requestContext,
  requestStartedAt,
  timeoutMs,
  retryAttempts,
  attempt = 0,
}) {
  const attemptStartedAt = Date.now();
  // eslint-disable-next-line no-console
  console.info(JSON.stringify({
    event: 'gemini_request_start',
    model: requestContext.model,
    attempt: attempt + 1,
    promptLength: requestContext.promptLength,
  }));

  try {
    const result = await withTimeout(model.generateContent(message), timeoutMs);

    const response = result && result.response;
    const text = response && typeof response.text === 'function' ? response.text() : '';
    const reply = String(text || '').trim();

    // eslint-disable-next-line no-console
    console.info(JSON.stringify({
      event: 'gemini_request_success',
      model: requestContext.model,
      attempt: attempt + 1,
      durationMs: Date.now() - attemptStartedAt,
      totalDurationMs: Date.now() - requestStartedAt,
      responseLength: reply.length,
    }));

    return {
      reply: reply || 'I am here to help with English learning.',
      source: 'gemini',
      model: requestContext.model,
      attempts: attempt + 1,
      fallbackReason: null,
    };
  } catch (error) {
    const errorInfo = getUpstreamErrorInfo(error);

    // eslint-disable-next-line no-console
    console.warn(JSON.stringify({
      event: 'gemini_request_failure',
      model: requestContext.model,
      attempt: attempt + 1,
      durationMs: Date.now() - attemptStartedAt,
      totalDurationMs: Date.now() - requestStartedAt,
      status: errorInfo.status,
      statusText: errorInfo.statusText,
      message: errorInfo.message,
      details: errorInfo.details,
    }));

    if (errorInfo.status === 429) {
      const retryAfterMs = Math.max(
        COOLDOWN_ON_QUOTA_MS,
        (requestContext.retryDelayMs || BASE_BACKOFF_MS) * (2 ** attempt),
      );
      cooldownUntil = Date.now() + retryAfterMs;

      // eslint-disable-next-line no-console
      console.warn(JSON.stringify({
        event: 'gemini_cooldown_set',
        model: requestContext.model,
        cooldownMs: retryAfterMs,
        cooldownUntil,
      }));
    }

    const shouldRetry = attempt < retryAttempts && isRetryableUpstreamError(errorInfo);
    if (shouldRetry) {
      const backoffMs = Math.min(
        5000,
        (requestContext.retryDelayMs || BASE_BACKOFF_MS) * (2 ** attempt),
      );

      // eslint-disable-next-line no-console
      console.info(JSON.stringify({
        event: 'gemini_retry_scheduled',
        model: requestContext.model,
        attempt: attempt + 1,
        backoffMs,
      }));

      await sleep(backoffMs);
      return executeGeminiRequest({
        model,
        message,
        requestContext,
        requestStartedAt,
        timeoutMs,
        retryAttempts,
        attempt: attempt + 1,
      });
    }

    return {
      reply: buildFallbackReply(message),
      source: 'fallback',
      model: requestContext.model,
      attempts: attempt + 1,
      fallbackReason: errorInfo.message,
      fallbackStatus: errorInfo.status,
    };
  }
}

async function generateResponse(rawMessage, options = {}) {
  const message = String(rawMessage || '').trim();

  if (!message) {
    const error = new Error('Empty message');
    error.code = 'EMPTY_MESSAGE';
    throw error;
  }

  if (message.length > MAX_INPUT_LENGTH) {
    const error = new Error('Message too long');
    error.code = 'TOO_LONG';
    throw error;
  }

  const model = getModel();
  if (!model) {
    return `AI not configured (no GEMINI_API_KEY). Received: "${message}"`;
  }

  const requestContext = getRequestContext(message);
  const initialCooldownRemaining = getCooldownRemainingMs();
  if (initialCooldownRemaining > 0) {
    const cooldownMessage = [
      `Gemini cooldown active for ${initialCooldownRemaining}ms.`,
      `Using fallback reply for model=${requestContext.model}.`,
    ].join(' ');

    // eslint-disable-next-line no-console
    console.warn(cooldownMessage);
    return buildFallbackReply(message);
  }

  const requestStartedAt = Date.now();
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const retryAttempts = Number.isInteger(options.retryAttempts)
    ? options.retryAttempts
    : MAX_RETRY_ATTEMPTS;

  try {
    const execution = await executeGeminiRequest({
      model,
      message,
      requestContext: {
        ...requestContext,
        retryDelayMs: options.retryDelayMs,
      },
      requestStartedAt,
      timeoutMs,
      retryAttempts,
    });

    if (execution.source === 'fallback') {
      // eslint-disable-next-line no-console
      console.warn(JSON.stringify({
        event: 'gemini_fallback_reply',
        model: execution.model,
        attempts: execution.attempts,
        status: execution.fallbackStatus || null,
        reason: execution.fallbackReason || 'Gemini unavailable',
      }));
    }

    return execution.reply;
  } catch (error) {
    // Defensive only; the main flow already returns fallback on upstream failure.
    // eslint-disable-next-line no-console
    const errorMessage = error?.message || '';
    console.warn(
      'Gemini request failed unexpectedly; using fallback reply. ',
      errorMessage,
    );
    return buildFallbackReply(message);
  }
}

module.exports = {
  generateResponse,
  _getModel: getModel,
  _createModel: createModel,
};
