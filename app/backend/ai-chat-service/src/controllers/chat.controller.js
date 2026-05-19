const geminiService = require('../services/gemini.service');
const conversationRepository = require('../repositories/conversation.repository');
const { validateChatRequest } = require('../utils/chat-validator');

function classifyIntent(message = '') {
  const normalized = String(message).toLowerCase();

  if (normalized.includes('translate') || normalized.includes('dịch')) return 'translation';
  if (normalized.includes('explain') || normalized.includes('giải thích')) return 'explanation';
  if (normalized.includes('quiz') || normalized.includes('test')) return 'assessment';
  if (normalized.includes('flashcard') || normalized.includes('card')) return 'flashcard';
  return normalized ? 'learning' : 'unknown';
}

function classifyTopics(message = '') {
  const normalized = String(message).toLowerCase();
  const topics = [];

  if (normalized.includes('grammar')) topics.push('grammar');
  if (normalized.includes('vocabulary')) topics.push('vocabulary');
  if (normalized.includes('speaking')) topics.push('speaking');
  if (normalized.includes('listening')) topics.push('listening');
  if (normalized.includes('reading')) topics.push('reading');
  if (normalized.includes('writing')) topics.push('writing');
  if (normalized.includes('ielts')) topics.push('ielts');
  if (normalized.includes('toeic')) topics.push('toeic');

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

async function handleChat(req, res, next) {
  try {
    const chatRequest = validateChatRequest(req.body);
    const reply = await geminiService.generateResponse(chatRequest);

    sendAnalyticsEvent({
      userId: chatRequest.userId || req.body?.userId || 'anonymous',
      endpoint: '/api/chat',
      method: 'POST',
      timestamp: new Date().toISOString(),
      responseTime: 0,
      statusCode: 200,
      tokenEstimate: Math.max(1, Math.ceil(String(chatRequest.message || '').length / 4)),
      service: 'ai-chat-service',
      intent: classifyIntent(chatRequest.message),
      topic: classifyTopics(chatRequest.message).join(', '),
    });

    return res.json({ success: true, reply });
  } catch (err) {
    return next(err);
  }
}

async function listConversations(req, res, next) {
  try {
    const conversations = await conversationRepository.listConversations({
      userId: req.query.userId,
      limit: req.query.limit,
    });
    return res.json({ success: true, conversations });
  } catch (err) {
    return next(err);
  }
}

async function getConversation(req, res, next) {
  try {
    const conversation = await conversationRepository.getConversation(req.params.conversationId, {
      userId: req.query.userId,
      limit: req.query.limit,
    });

    if (!conversation) {
      const error = new Error('Conversation not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    return res.json({ success: true, conversation });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  handleChat,
  listConversations,
  getConversation,
};
