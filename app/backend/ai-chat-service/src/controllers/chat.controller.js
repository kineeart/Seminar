const geminiService = require('../services/gemini.service');

async function handleChat(req, res, next) {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Empty message' });
    }

    const reply = await geminiService.generateResponse(message);

    return res.json({ success: true, reply });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  handleChat,
};
