const progressService = require('../services/progress.service');
const { generateAILearningAnalysis } = require('../services/ai-analysis.service');

function generateLearningAnalysis(progress) {
  const accuracy = progress.quiz_accuracy || 0;
  const streak = progress.streak_days || 0;
  const wordsLearned = progress.learned_words_count || 0;
  const quizzesCompleted = progress.quizzes_completed || 0;
  const totalStudySeconds = progress.total_study_seconds || 0;
  const studyHours = Math.round(totalStudySeconds / 360 * 10) / 10;

  const weakTopics = progress.weak_topics || [];
  const weakWords = (progress.weak_words || []).slice(0, 8);
  const wordMastery = progress.word_mastery || {};
  const lowMasteryWords = Object.entries(wordMastery)
    .filter(([_, data]) => (data.mastery || 0) < 60)
    .slice(0, 5);

  let accuracyAnalysis = '';
  if (accuracy >= 85) {
    accuracyAnalysis = '🎯 Outstanding accuracy! You demonstrate excellent understanding of vocabulary and quiz content. Your retention rate is at a superior level.';
  } else if (accuracy >= 70) {
    accuracyAnalysis = '✅ Strong performance! You have a solid grasp of most concepts. Focus on the weaker areas to reach expert level.';
  } else if (accuracy >= 55) {
    accuracyAnalysis = '📈 Good progress! You are building a foundation. Additional practice on challenging topics will significantly boost your score.';
  } else {
    accuracyAnalysis = '📚 Keep going! Your accuracy suggests room for improvement. Consistent review of weak words will help you progress faster.';
  }

  let streakAnalysis = '';
  if (streak >= 10) {
    streakAnalysis = `🔥 Exceptional dedication! ${streak} consecutive days of learning shows strong commitment. This consistency is the key to long-term mastery.`;
  } else if (streak >= 5) {
    streakAnalysis = `👍 Great habit building! ${streak} days in a row demonstrates real progress. Keep the momentum going to solidify your learning routine.`;
  } else if (streak >= 2) {
    streakAnalysis = `🌱 Good start! ${streak} days shows you are building momentum. Try to maintain daily practice for better retention.`;
  } else {
    streakAnalysis = '💪 Start your streak! Daily practice significantly improves vocabulary retention. Even 10 minutes a day makes a difference.';
  }

  let topicAnalysis = '';
  if (weakTopics.length > 0) {
    topicAnalysis = `⚠️ Areas for improvement: ${weakTopics.slice(0, 3).join(', ')}. These topics showed lower accuracy in recent quizzes. Targeted practice here will yield quick gains.`;
  } else {
    topicAnalysis = '🎉 Well balanced! You show consistent performance across all topics. Continue exploring new vocabulary areas to broaden your skills.';
  }

  let vocabularyAnalysis = '';
  if (wordsLearned >= 200) {
    vocabularyAnalysis = `📖 Impressive vocabulary! You have learned ${wordsLearned} words - equivalent to an advanced intermediate learner. Focus on nuanced usage and collocations.`;
  } else if (wordsLearned >= 100) {
    vocabularyAnalysis = `📖 Solid vocabulary base! ${wordsLearned} words learned shows steady progress. You are building a strong foundation for advanced communication.`;
  } else if (wordsLearned >= 50) {
    vocabularyAnalysis = `📖 Good progress! ${wordsLearned} words in your active vocabulary. Continue expanding at this pace for noticeable improvement.`;
  } else {
    vocabularyAnalysis = `📖 Building foundation! ${wordsLearned} words learned so far. Consistent daily learning will quickly expand your vocabulary.`;
  }

  let recommendation = '';
  if (accuracy < 70 && weakWords.length > 0) {
    recommendation = `Priority: Review weak words like "${weakWords.slice(0, 3).map(w => w.word || w).join('", "')}". Master these before moving to advanced topics.`;
  } else if (weakTopics.length > 0) {
    recommendation = `Priority: Focus on ${weakTopics[0]} topic. Complete 2-3 quizzes in this area to strengthen your understanding.`;
  } else {
    recommendation = 'Priority: Challenge yourself with harder quizzes or explore new vocabulary topics to continue growing.';
  }

  return {
    summary: {
      accuracy,
      streak,
      wordsLearned,
      quizzesCompleted,
      studyHours,
      weakTopicsCount: weakTopics.length,
      weakWordsCount: weakWords.length,
    },
    analysis: {
      accuracy: accuracyAnalysis,
      streak: streakAnalysis,
      topic: topicAnalysis,
      vocabulary: vocabularyAnalysis,
    },
    recommendation,
    weakWords: weakWords.map(w => w.word || w).slice(0, 5),
    nextQuizTopic: weakTopics[0] || 'general',
  };
}

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

async function getRecommendations(req, res, next) {
  try {
    const userId = req.query.userId || req.body?.userId;
    const recommendations = await progressService.getRecommendations(userId);
    return res.status(200).json({ success: true, recommendations });
  } catch (err) {
    return next(err);
  }
}

async function getLearningAnalysis(req, res, next) {
  try {
    const userId = req.query.userId || req.body?.userId;
    const progress = await progressService.getProgress(userId);

    // Check if user wants AI-generated analysis (via query param)
    const useAI = req.query.useAI === 'true' || req.body?.useAI === true;

    let analysis;
    if (useAI) {
      // Call AI service for detailed analysis
      analysis = await generateAILearningAnalysis(progress, userId);
    } else {
      // Use rule-based analysis
      analysis = generateLearningAnalysis(progress);
    }

    return res.status(200).json({ success: true, analysis });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getProgress,
  recordFlashcardReview,
  recordChatActivity,
  getRecommendations,
  getLearningAnalysis,
};
