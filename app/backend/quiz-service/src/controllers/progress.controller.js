const progressService = require('../services/progress.service');

async function getProgress(req, res, next) {
  try {
    const progress = await progressService.getProgress(req.query.userId);
    return res.status(200).json({ success: true, progress });
  } catch (err) {
    return next(err);
  }
}

async function recordFlashcardReview(req, res, next) {
  try {
    const progress = await progressService.recordFlashcardReview(req.body || {});
    return res.status(200).json({ success: true, progress });
  } catch (err) {
    return next(err);
  }
}

async function recordChatActivity(req, res, next) {
  try {
    const progress = await progressService.recordChatActivity(req.body || {});
    return res.status(200).json({ success: true, progress });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getProgress,
  recordFlashcardReview,
  recordChatActivity,
};
