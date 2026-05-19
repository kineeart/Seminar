const FlashcardService = require('../services/flashcard.service');
const logger = require('../utils/logger');

function classifyTopics(messages = []) {
  const text = messages.map((message) => String(message?.content || message?.text || '')).join(' ').toLowerCase();
  const topics = [];

  if (text.includes('grammar')) topics.push('grammar');
  if (text.includes('vocabulary')) topics.push('vocabulary');
  if (text.includes('speaking')) topics.push('speaking');
  if (text.includes('listening')) topics.push('listening');
  if (text.includes('reading')) topics.push('reading');
  if (text.includes('writing')) topics.push('writing');
  if (text.includes('ielts')) topics.push('ielts');
  if (text.includes('toeic')) topics.push('toeic');

  return topics.length ? topics : ['general'];
}

function sendAnalyticsEvent(payload) {
  const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:5005';
  fetch(`${analyticsUrl}/logs/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

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

    sendAnalyticsEvent({
      userId: userId || 'anonymous',
      endpoint: '/api/flashcards/generate',
      method: 'POST',
      timestamp: new Date().toISOString(),
      responseTime: 0,
      statusCode: 200,
      tokenEstimate: Math.max(1, Math.ceil(JSON.stringify(messages || []).length / 4)),
      service: 'flashcard-service',
      topic: classifyTopics(messages).join(', '),
      generatedCount: Array.isArray(result) ? result.length : 0,
      topics: classifyTopics(messages),
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

exports.batchCreate = async (req, res, next) => {
  try {
    const { userId, conversationId, flashcards, source } = req.body || {};
    logger.info('[FLASHCARD_BATCH_CREATE_START]', {
      userId,
      conversationId,
      count: Array.isArray(flashcards) ? flashcards.length : 0,
    });

    if (!userId || !conversationId || !Array.isArray(flashcards)) {
      return res.status(400).json({ error: 'userId, conversationId, and flashcards[] are required' });
    }

    if (flashcards.length === 0) {
      return res.json({ success: true, saved: [] });
    }

    const result = await FlashcardService.batchCreate({
      userId,
      conversationId,
      source: source || 'chat-inline',
      flashcards,
    });

    logger.info('[FLASHCARD_BATCH_CREATE_SUCCESS]', { userId, savedCount: result.length });
    return res.json({ success: true, saved: result });
  } catch (err) {
    logger.error('[FLASHCARD_BATCH_CREATE_FAIL]', { error: err.message });
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
