const { generateAnalysis } = require('../services/analysis.service');

async function getLearningAnalysis(req, res, next) {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const analysis = await generateAnalysis(userId);
    return res.json({ success: true, analysis });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getLearningAnalysis };
