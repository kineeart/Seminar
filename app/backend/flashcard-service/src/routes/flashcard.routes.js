const express = require('express');

const router = express.Router();

const controller = require('../controllers/flashcard.controller');

router.get('/health', controller.health);
router.post('/generate', controller.generateFlashcards);
router.get('/history', controller.getHistory);
router.get('/stats', controller.getStats);
router.post('/:flashcardId/review', controller.markReviewed);

module.exports = router;
