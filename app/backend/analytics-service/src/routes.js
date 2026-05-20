const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/health', controller.health);
router.post('/logs/ingest', controller.ingestLog);
router.get('/learning-analysis', controller.getLearningAnalysis);

router.use(controller.requireAdmin);
router.get('/logs', controller.getLogs);
router.get('/stats', controller.getSummary);
router.get('/prompts', controller.getPrompts);
router.post('/prompts/:service', controller.updatePrompt);
router.get('/chat', controller.getChatAnalytics);
router.get('/flashcards', controller.getFlashcardAnalytics);
router.get('/topics', controller.getTopicStats);

module.exports = router;
