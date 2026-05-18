const FlashcardService = require('../services/flashcard.service');
const logger = require('../utils/logger');

exports.health = (req, res) => {
  res.json({ status: 'ok', service: 'flashcard-service' });
};

exports.generateFlashcards = async (req, res, next) => {
  try {
    const { conversationId, messages } = req.body || {};
    logger.info('[FLASHCARD_GENERATION_START]', { conversationId, messageCount: Array.isArray(messages) ? messages.length : 0 });

    if (!conversationId || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'conversationId and messages[] are required' });
    }

    const result = await FlashcardService.generateFromConversation(conversationId, messages);

    logger.info('[FLASHCARD_GENERATION_SUCCESS]', { conversationId, count: Array.isArray(result) ? result.length : 0 });
    return res.json({ conversationId, flashcards: result });
  } catch (err) {
    logger.error('[FLASHCARD_GENERATION_FAIL]', { error: err.message });
    return next(err);
  }
};
