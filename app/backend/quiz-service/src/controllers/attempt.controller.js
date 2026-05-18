const attemptService = require('../services/attempt.service');

async function listAttempts(req, res, next) {
  try {
    const attempts = await attemptService.listAttempts({
      userId: req.query.userId,
      quizId: req.query.quizId,
    });
    return res.status(200).json({ success: true, attempts });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listAttempts,
};
