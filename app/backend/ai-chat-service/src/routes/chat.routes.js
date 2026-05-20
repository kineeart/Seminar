const express = require('express');
const controller = require('../controllers/chat.controller');

const router = express.Router();

router.post('/', controller.handleChat);
router.post('/save-flashcards-with-topic', controller.saveFlashcardsWithTopic);
router.post('/analyze', controller.analyzeLearning);
router.get('/conversations', controller.listConversations);
router.get('/conversations/:conversationId', controller.getConversation);

module.exports = router;
