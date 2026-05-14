const geminiService = require('../services/gemini.service');
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

module.exports = {
  handleChat,
};
