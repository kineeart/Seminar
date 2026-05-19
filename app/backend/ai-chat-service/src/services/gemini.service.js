const { GoogleGenerativeAI } = require('@google/generative-ai');

const { validateChatRequest, normalizeLevel } = require('../utils/chat-validator');
const { appendConversationMessages, getConversationHistory } = require('../utils/conversation-memory');
const { SYSTEM_PROMPT, buildTutorPrompt, buildRoleplayPrompt, isFlashcardRequest, buildFlashcardPrompt, FLASHCARD_SYSTEM_PROMPT } = require('../utils/prompt-builder');
const progressClient = require('../utils/progress-client');

const MAX_INPUT_LENGTH = 2000;
const DEFAULT_TIMEOUT_MS = 30000;
const FLASHCARD_TIMEOUT_MS = 90000;

// ─── Provider: OpenAI-compatible (chiasegpu) ───────────────────────────────────

async function callOpenAICompatible(prompt, systemPrompt, options = {}) {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL;
  const model = options.model || process.env.LLM_MODEL || 'MiniMax-M2.7';

  if (!apiKey || !baseUrl) return null;

  const maxTokens = options.maxTokens || 1024;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const err = new Error(`OpenAI-compatible API error: ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';
  // Strip <think>...</think> reasoning tags if present
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  return cleaned || null;
}

// ─── Provider: Google Gemini ───────────────────────────────────────────────────

function createGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
  });
}

async function callGemini(prompt) {
  const model = createGeminiModel();
  if (!model) return null;

  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini timeout')), DEFAULT_TIMEOUT_MS)
    ),
  ]);

  const response = result?.response;
  const text = response && typeof response.text === 'function' ? response.text() : '';
  return text.trim() || null;
}

// ─── Main: Try providers in order ──────────────────────────────────────────────

function buildFallbackReply(message, mode) {
  if (mode === 'roleplay') {
    return "Sure! Let me check that for you. What else can I help you with?";
  }
  return 'AI tutor is temporarily busy. Please try again in a few seconds.';
}

function logInfo(event, payload) {
  console.info(JSON.stringify({ event, ...payload }));
}

function logWarn(event, payload) {
  console.warn(JSON.stringify({ event, ...payload }));
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
      logWarn('progress_chat_activity_failure', { userId, message: error.message });
    }
  }
}

async function generateResponse(rawInput, options = {}) {
  const request = typeof rawInput === 'string' ? { message: rawInput } : rawInput || {};
  const { message, level, conversationId, userId, mode, scenario } = validateChatRequest(request);

  if (message.length > MAX_INPUT_LENGTH) {
    const error = new Error('Message too long');
    error.code = 'TOO_LONG';
    throw error;
  }

  const history = await getConversationHistory(conversationId);

  // Determine if this is a flashcard request — use dedicated prompt
  const needsFlashcards = mode !== 'roleplay' && isFlashcardRequest(message);

  let prompt;
  if (mode === 'roleplay') {
    prompt = buildRoleplayPrompt({ message, level, history, scenario });
  } else if (needsFlashcards) {
    prompt = buildFlashcardPrompt({ message, level, history });
  } else {
    prompt = buildTutorPrompt({ message, level, history });
  }

  let reply = null;
  let source = 'fallback';

  // Determine if this is a flashcard request (needs more tokens for JSON output)
  const llmOptions = needsFlashcards ? { maxTokens: 4096, timeoutMs: FLASHCARD_TIMEOUT_MS } : {};
  const systemPrompt = needsFlashcards ? FLASHCARD_SYSTEM_PROMPT : SYSTEM_PROMPT;

  // For flashcard requests, use dedicated flashcard model via OpenAI-compatible API
  // For normal requests, use OpenAI-compatible first, Gemini as fallback
  if (needsFlashcards) {
    // Use flashcard model (no fallback needed — single call)
    try {
      const flashcardModel = process.env.FLASHCARD_LLM_MODEL || 'rhika/grok-4.20-0309-reasoning-super';
      logInfo('llm_request_start', { provider: 'openai-compatible', model: flashcardModel, reason: 'flashcard' });
      reply = await callOpenAICompatible(prompt, systemPrompt, { ...llmOptions, model: flashcardModel });
      if (reply) {
        source = 'openai-compatible-flashcard';
        logInfo('llm_request_success', { provider: 'openai-compatible', model: flashcardModel, replyLength: reply.length });
      }
    } catch (err) {
      logWarn('llm_request_failure', { provider: 'openai-compatible-flashcard', status: err.status, message: err.message });
    }
  } else {
    // 1. Try OpenAI-compatible (chiasegpu) first for normal chat
    try {
      logInfo('llm_request_start', { provider: 'openai-compatible', model: process.env.LLM_MODEL });
      reply = await callOpenAICompatible(prompt, systemPrompt, llmOptions);
      if (reply) {
        source = 'openai-compatible';
        logInfo('llm_request_success', { provider: 'openai-compatible', replyLength: reply.length });
      }
    } catch (err) {
      logWarn('llm_request_failure', { provider: 'openai-compatible', status: err.status, message: err.message });
    }

    // 2. If failed, try Gemini as fallback
    if (!reply) {
      try {
        logInfo('llm_request_start', { provider: 'gemini', model: process.env.GEMINI_MODEL });
        reply = await callGemini(prompt);
        if (reply) {
          source = 'gemini';
          logInfo('llm_request_success', { provider: 'gemini', replyLength: reply.length });
        }
      } catch (err) {
        logWarn('llm_request_failure', { provider: 'gemini', status: err.status, message: err.message });
      }
    }
  }

  // 3. If both failed, use fallback
  if (!reply) {
    reply = buildFallbackReply(message, mode);
    logWarn('llm_all_providers_failed', { conversationId });
  }

  await persistConversationActivity(conversationId, userId, level, message, reply);
  return reply;
}

module.exports = {
  generateResponse,
};
