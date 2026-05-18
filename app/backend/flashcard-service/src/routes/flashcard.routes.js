const express = require('express');

const router = express.Router();

const controller = require('../controllers/flashcard.controller');

router.get('/health', controller.health);
router.post('/generate', controller.generateFlashcards);

module.exports = router;
