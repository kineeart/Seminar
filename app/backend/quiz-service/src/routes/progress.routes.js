const express = require('express');
const controller = require('../controllers/progress.controller');

const router = express.Router();

router.get('/', controller.getProgress);
router.get('/recommendations', controller.getRecommendations);
router.post('/flashcard-review', controller.recordFlashcardReview);
router.post('/chat-activity', controller.recordChatActivity);

module.exports = router;
