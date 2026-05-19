const geminiService = require('../services/gemini.service');
const conversationRepository = require('../repositories/conversation.repository');
const { validateChatRequest } = require('../utils/chat-validator');
const { detectGoalProgress, ROLEPLAY_SCENARIOS } = require('../utils/prompt-builder');
const { getConversationHistory } = require('../utils/conversation-memory');
const { extractFlashcards } = require('../utils/flashcard-response-parser');
const flashcardClient = require('../utils/flashcard-client');

async function handleChat(req, res, next) {
  try {
    const chatRequest = validateChatRequest(req.body);
    const reply = await geminiService.generateResponse(chatRequest);

    // For roleplay mode, include goal progress
    let goalProgress = null;
    if (chatRequest.mode === 'roleplay') {
      const scenario = chatRequest.scenario || 'coffee';
      const history = await getConversationHistory(chatRequest.conversationId);
      const progress = detectGoalProgress(scenario, chatRequest.message, history);
      const scenarioData = ROLEPLAY_SCENARIOS[scenario];

      // Check if reply contains [GOAL_COMPLETE] marker
      let cleanReply = reply;
      let isComplete = progress.isComplete || reply.includes('[GOAL_COMPLETE]');
      if (reply.includes('[GOAL_COMPLETE]')) {
        cleanReply = reply.replace('[GOAL_COMPLETE]', '').trim();
      }

      goalProgress = {
        completedSteps: progress.completedSteps,
        totalSteps: progress.totalSteps,
        isComplete,
        completionMessage: isComplete ? scenarioData?.completionMessage : null,
      };

      return res.json({ success: true, reply: cleanReply, goalProgress });
    }

    // For knowledge mode, check for inline flashcards
    const { cleanReply, flashcards } = extractFlashcards(reply);

    console.info(JSON.stringify({
      event: 'flashcard_extraction',
      flashcardsFound: flashcards.length,
      userId: chatRequest.userId || null,
      hasMarker: reply.includes('```flashcards'),
    }));

    if (flashcards.length > 0) {
      // Always try to save — use userId or fallback to 'guest'
      const saveUserId = chatRequest.userId || 'guest';
      try {
        const savedFlashcards = await flashcardClient.saveFlashcards({
          userId: saveUserId,
          conversationId: chatRequest.conversationId,
          flashcards,
        });

        console.info(JSON.stringify({
          event: 'flashcard_saved',
          count: savedFlashcards.length,
          userId: saveUserId,
        }));

        return res.json({
          success: true,
          reply: cleanReply,
          flashcards: savedFlashcards.length > 0 ? savedFlashcards : flashcards,
          conversationId: chatRequest.conversationId,
        });
      } catch (saveErr) {
        console.warn(JSON.stringify({
          event: 'flashcard_save_error',
          message: saveErr.message,
          conversationId: chatRequest.conversationId,
        }));
      }

      // Return flashcards even if save failed
      return res.json({
        success: true,
        reply: cleanReply,
        flashcards,
        conversationId: chatRequest.conversationId,
      });
    }

    return res.json({ success: true, reply: cleanReply });
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
