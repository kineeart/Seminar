const geminiService = require('../services/gemini.service');
const conversationRepository = require('../repositories/conversation.repository');
const { validateChatRequest } = require('../utils/chat-validator');

async function handleChat(req, res, next) {
  try {
    const chatRequest = validateChatRequest(req.body);
    const reply = await geminiService.generateResponse(chatRequest);

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
