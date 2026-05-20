const geminiService = require('../services/gemini.service');
const conversationRepository = require('../repositories/conversation.repository');
const { validateChatRequest } = require('../utils/chat-validator');
const { detectGoalProgress, ROLEPLAY_SCENARIOS } = require('../utils/prompt-builder');
const { getConversationHistory } = require('../utils/conversation-memory');
const { extractFlashcards } = require('../utils/flashcard-response-parser');
const flashcardClient = require('../utils/flashcard-client');

let geminiClient = null;
try {
  geminiClient = require('../services/gemini.service');
} catch (err) {
  // Gemini service is optional
}

function extractTopicName(message = '') {
  const text = String(message || '').trim();
  if (!text) return null;
  const patterns = [
    /chủ đề\s+["“]?([^"”\n,.!?]+)["”]?/i,
    /topic\s*[:\-]\s*["“]?([^"”\n,.!?]+)["”]?/i,
    /về\s+["“]?([^"”\n,.!?]+)["”]?/i,
    /about\s+["“]?([^"”\n,.!?]+)["”]?/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

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

      return res.json({
        success: true,
        reply: cleanReply,
        goalProgress,
        conversationId: chatRequest.conversationId,
      });
    }

    // For knowledge mode, check for inline flashcards
    const { cleanReply, flashcards } = extractFlashcards(reply);
    const topic = extractTopicName(chatRequest.message);

    if (flashcards.length > 0 && !topic) {
      // Ask user to name the topic before saving flashcards
      return res.json({
        success: true,
        reply: `Tôi đã tạo được ${flashcards.length} flashcard. Bạn muốn đặt tên topic là gì? (Ví dụ: "Office TOEIC", "Travel Vocabulary")`,
        flashcards: [],
        rawFlashcards: flashcards,
        pendingTopic: true,
        conversationId: chatRequest.conversationId,
      });
    }

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
          topic: topic || 'general',
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
        topic: topic || 'general',
        conversationId: chatRequest.conversationId,
      });
    }

    return res.json({
      success: true,
      reply: cleanReply,
      conversationId: chatRequest.conversationId,
    });
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

async function saveFlashcardsWithTopic(req, res, next) {
  try {
    const { topic, conversationId, userId, flashcards } = req.body || {};

    if (!topic || !conversationId || !Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({ error: 'topic, conversationId, and flashcards[] are required' });
    }

    const saveUserId = userId || 'guest';

    const savedFlashcards = await flashcardClient.saveFlashcards({
      userId: saveUserId,
      conversationId,
      topic: topic.trim(),
      flashcards,
    });

    console.info(JSON.stringify({
      event: 'flashcard_saved_with_topic',
      count: savedFlashcards.length,
      userId: saveUserId,
      topic: topic.trim(),
    }));

    return res.json({
      success: true,
      reply: `Đã lưu ${savedFlashcards.length} flashcard vào topic "${topic.trim()}"!`,
      flashcards: savedFlashcards,
      conversationId,
    });
  } catch (err) {
    console.error('[SAVE_FLASHCARDS_WITH_TOPIC_ERROR]', err.message);
    return next(err);
  }
}

async function analyzeLearning(req, res, next) {
  try {
    const { systemPrompt, userPrompt, userId, timeoutMs } = req.body || {};

    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'systemPrompt and userPrompt are required' });
    }

    // Use geminiService to generate response
    const reply = await geminiService.generateResponse({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      userId: userId || 'guest',
      mode: 'knowledge',
      timeoutMs: timeoutMs || 60000,
    });

    return res.json({
      success: true,
      reply: reply || 'Unable to generate analysis at this time.',
    });
  } catch (err) {
    console.error('[ANALYZE_LEARNING_ERROR]', err.message);
    return next(err);
  }
}

module.exports = {
  handleChat,
  listConversations,
  getConversation,
  saveFlashcardsWithTopic,
  analyzeLearning,
};
