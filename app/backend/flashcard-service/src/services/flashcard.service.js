const aiService = require('./flashcard-ai.service');
const parser = require('../utils/flashcard-parser');
const logger = require('../utils/logger');
const flashcardRepository = require('../repositories/flashcard.repository');
const { createId } = require('../utils/id');

const promptBuilder = require('../utils/prompt-builder');

let progressService = null;
try {
  progressService = require('../utils/progress-client');
} catch (err) {
  // Progress tracking is optional
}

async function generateFromConversation({ conversationId, userId, messages, topic }) {
  // Build prompt
  const prompt = promptBuilder.buildSystemPrompt(messages);

  logger.info('[GEMINI_REQUEST_START]', { model: process.env.GEMINI_MODEL || 'gemini', timestamp: new Date().toISOString() });
  const start = Date.now();

  const aiResponse = await aiService.callGemini(prompt, { model: process.env.GEMINI_MODEL });

  const duration = Date.now() - start;
  logger.info('[GEMINI_RESPONSE_RECEIVED]', { duration, responseLength: aiResponse ? String(aiResponse).length : 0 });

  const parsed = parser.parseAndValidate(aiResponse);

  logger.info('[PARSER_VALIDATION]', { validCount: parsed.valid.length, invalidCount: parsed.invalid.length });

  const ownerId = userId || 'guest';

  const flashcardsToSave = parsed.valid.map((card) => ({
    _id: createId('flashcard'),
    user_id: ownerId,
    conversation_id: String(conversationId),
    topic: String(topic || 'general'),
    word: card.word,
    ipa: card.ipa,
    meaning: card.meaning,
    example: card.example,
    source: 'ai',
  }));

  if (!flashcardsToSave.length) {
    return [];
  }

  return flashcardRepository.createFlashcards(flashcardsToSave);
}

async function listHistory({ userId, conversationId, topic, limit, offset }) {
  return flashcardRepository.listFlashcards({
    userId,
    conversationId,
    topic,
    limit,
    offset,
  });
}

async function getStats(userId) {
  return flashcardRepository.getStats(userId);
}

async function markReviewed(flashcardId) {
  const flashcard = await flashcardRepository.markReviewed(flashcardId);

  if (flashcard && flashcard.user_id && progressService) {
    await progressService.recordFlashcardReview({
      userId: flashcard.user_id,
      reviewedAt: flashcard.reviewed_at || new Date().toISOString(),
    });
  }

  return flashcard;
}

async function batchCreate({ userId, conversationId, source, topic, flashcards }) {
  const ownerId = userId || 'guest';
  const flashcardsWithIds = flashcards.map((card) => ({
    _id: createId('flashcard'),
    word: card.word,
    ipa: card.ipa || '',
    meaning: card.meaning,
    example: card.example,
  }));

  return flashcardRepository.batchCreate({
    userId: ownerId,
    conversationId: String(conversationId || ''),
    source: source || 'chat-inline',
    topic: topic || 'general',
    flashcards: flashcardsWithIds,
  });
}

module.exports = {
  generateFromConversation,
  batchCreate,
  listHistory,
  getStats,
  markReviewed,
};
