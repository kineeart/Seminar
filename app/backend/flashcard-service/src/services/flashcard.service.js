const aiService = require('./flashcard-ai.service');
const parser = require('../utils/flashcard-parser');
const logger = require('../utils/logger');

const promptBuilder = require('../utils/prompt-builder');

async function generateFromConversation(conversationId, messages) {
  // Build prompt
  const prompt = promptBuilder.buildSystemPrompt(messages);

  logger.info('[GEMINI_REQUEST_START]', { model: process.env.GEMINI_MODEL || 'gemini', timestamp: new Date().toISOString() });
  const start = Date.now();

  const aiResponse = await aiService.callGemini(prompt, { model: process.env.GEMINI_MODEL });

  const duration = Date.now() - start;
  logger.info('[GEMINI_RESPONSE_RECEIVED]', { duration, responseLength: aiResponse ? String(aiResponse).length : 0 });

  const parsed = parser.parseAndValidate(aiResponse);

  logger.info('[PARSER_VALIDATION]', { validCount: parsed.valid.length, invalidCount: parsed.invalid.length });

  // Return valid flashcards
  return parsed.valid;
}

module.exports = { generateFromConversation };
