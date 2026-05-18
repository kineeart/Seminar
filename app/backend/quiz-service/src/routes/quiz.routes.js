const express = require('express');
const controller = require('../controllers/quiz.controller');

const router = express.Router();

router.post('/generate', controller.generateQuiz);
router.get('/:quizId', controller.getQuiz);
router.post('/:quizId/submit', controller.submitQuiz);

module.exports = router;
