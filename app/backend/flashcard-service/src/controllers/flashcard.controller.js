const FlashcardService = require('../services/flashcard.service');
const logger = require('../utils/logger');

exports.health = (req, res) => {
  res.json({ status: 'ok', service: 'flashcard-service' });
};

exports.generateFlashcards = async (req, res, next) => {
  try {
    const { conversationId, messages, userId } = req.body || {};
    logger.info('[FLASHCARD_GENERATION_START]', {
      conversationId,
      userId,
      messageCount: Array.isArray(messages) ? messages.length : 0,
    });

    if (!conversationId || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'conversationId and messages[] are required' });
    }

    const result = await FlashcardService.generateFromConversation({
      conversationId,
      userId,
      messages,
    });

    logger.info('[FLASHCARD_GENERATION_SUCCESS]', { conversationId, count: Array.isArray(result) ? result.length : 0 });
    return res.json({ conversationId, flashcards: result });
  } catch (err) {
    logger.error('[FLASHCARD_GENERATION_FAIL]', { error: err.message });
    return next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { userId, conversationId, limit, offset } = req.query || {};
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const history = await FlashcardService.listHistory({
      userId,
      conversationId,
      limit,
      offset,
    });
    return res.json({ success: true, flashcards: history });
  } catch (err) {
    return next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const { userId } = req.query || {};
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const stats = await FlashcardService.getStats(userId);
    return res.json({ success: true, stats });
  } catch (err) {
    return next(err);
  }
};

exports.markReviewed = async (req, res, next) => {
  try {
    const { flashcardId } = req.params;
    const updated = await FlashcardService.markReviewed(flashcardId);
    if (!updated) {
      return res.status(404).json({ error: 'flashcard not found' });
    }
    return res.json({ success: true, flashcard: updated });
  } catch (err) {
    return next(err);
  }
};
