const quizService = require('../services/quiz.service');

async function generateQuiz(req, res, next) {
  try {
    const quiz = await quizService.generateQuiz(req.body || {});
    return res.status(201).json({ success: true, quiz });
  } catch (err) {
    return next(err);
  }
}

async function getQuiz(req, res, next) {
  try {
    const quiz = await quizService.getQuiz(req.params.quizId);
    return res.status(200).json({ success: true, quiz });
  } catch (err) {
    return next(err);
  }
}

async function submitQuiz(req, res, next) {
  try {
    const result = await quizService.submitQuiz(req.params.quizId, req.body || {});
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  generateQuiz,
  getQuiz,
  submitQuiz,
};
