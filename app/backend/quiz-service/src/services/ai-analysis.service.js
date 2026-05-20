const logger = require('../utils/logger');

/**
 * Generate a detailed AI Learning Analysis using AI Chat Service.
 * Role: English Learning Analyst & Tutor
 */
async function generateAILearningAnalysis(progress, userId) {
  const accuracy = progress.quiz_accuracy || 0;
  const streak = progress.streak_days || 0;
  const wordsLearned = progress.learned_words_count || 0;
  const quizzesCompleted = progress.quizzes_completed || 0;
  const totalStudySeconds = progress.total_study_seconds || 0;
  const studyHours = Math.round((totalStudySeconds / 3600) * 10) / 10;
  const weakTopics = progress.weak_topics || [];
  const weakWords = (progress.weak_words || []).slice(0, 15);
  const wordMastery = progress.word_mastery || {};
  const dailyActivity = progress.daily_activity || [];

  // Build user learning profile
  const learningProfile = {
    accuracy,
    streak,
    wordsLearned,
    quizzesCompleted,
    studyHours,
    weakTopics,
    weakWords: weakWords.slice(0, 10),
    masteryStats: Object.entries(wordMastery).length,
    activityDays: dailyActivity.length,
  };

  const systemPrompt = `You are an expert English Learning Analyst and Tutor AI. Your role is to provide detailed, encouraging, and actionable analysis of a student's learning progress.

Analyze the following learning data and provide a comprehensive JSON report with these exact fields:
{
  "greeting": "Personalized greeting with emoji",
  "overallSummary": "3-4 sentence overview of their learning journey",
  "accuracyAnalysis": {
    "level": "beginner|intermediate|advanced|excellent",
    "feedback": "Very detailed feedback (5-7 sentences) on accuracy with specific pedagogical tips",
    "tips": ["specific tip 1", "specific tip 2", "specific tip 3", "specific tip 4"]
  },
  "streakAnalysis": {
    "status": "building|consistent|dedicated|legendary",
    "feedback": "Detailed feedback on study habit (3-5 sentences)",
    "motivation": "Strong encouraging message"
  },
  "vocabularyInsights": {
    "level": "developing|growing|solid|impressive",
    "count": number,
    "feedback": "Detailed vocabulary progress analysis (4-6 sentences)",
    "recommendation": "Specific advice on how to expand vocabulary"
  },
  "topicAnalysis": {
    "strongTopics": ["topic1", "topic2"],
    "weakTopics": ["topic1", "topic2"],
    "feedback": "Detailed topic performance analysis with specific suggestions"
  },
  "personalInsights": {
    "learningStyle": "identified pattern",
    "strengths": ["strength 1", "strength 2"],
    "growthAreas": ["area 1", "area 2"]
  },
  "priorityActions": [
    {"priority": 1, "action": "Specific what to do", "words": ["word1", "word2"], "timeMinutes": 15},
    {"priority": 2, "action": "Next step", "words": [], "timeMinutes": 10}
  ],
  "motivationalClosing": "Inspiring closing statement with emoji"
}

Be detailed, warm, and pedagogically sound. Use specific numbers from the data.
Provide actionable, specific advice - not generic comments.`;

  const userPrompt = `Analyze this student's learning data in detail:

📊 LEARNING PROFILE
- Accuracy: ${accuracy}%
- Study Streak: ${streak} days
- Words Learned: ${wordsLearned}
- Quizzes Completed: ${quizzesCompleted}
- Total Study Time: ${studyHours} hours
- Weak Topics: ${weakTopics.join(', ') || 'None identified'}
- Weak Words (${weakWords.length}): ${weakWords.slice(0, 5).map(w => w.word || w).join(', ')}${weakWords.length > 5 ? '...' : ''}
- Words in Mastery Tracking: ${Object.entries(wordMastery).length}
- Active Study Days: ${dailyActivity.length}

Provide a comprehensive, personalized, and detailed learning analysis. Be specific, encouraging, and pedagogically sound.`;

  try {
    const AI_CHAT_SERVICE_URL = process.env.AI_CHAT_SERVICE_URL || 'http://localhost:5002';

    const response = await fetch(`${AI_CHAT_SERVICE_URL}/chat/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        userId,
        timeoutMs: 60000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.reply || data.message || '';

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = parseSimpleAnalysis(reply, learningProfile);
      }
    } catch (e) {
      analysis = parseSimpleAnalysis(reply, learningProfile);
    }

    return {
      ...analysis,
      generatedAt: new Date().toISOString(),
      rawData: learningProfile,
    };
  } catch (error) {
    logger.error('[AI_ANALYSIS_ERROR]', error.message);
    // Return fallback analysis
    return generateFallbackAnalysis(learningProfile);
  }
}

function parseSimpleAnalysis(response, profile) {
  // Fallback parser if JSON parsing fails
  return {
    greeting: '👋 Hello! Here is your personalized learning analysis.',
    overallSummary: response.slice(0, 300) + '...',
    accuracyAnalysis: {
      level: 'intermediate',
      feedback: response.slice(0, 500),
      tips: ['Practice daily for 15-20 minutes', 'Review weak words before new lessons', 'Focus on one topic at a time', 'Take regular quizzes to track progress'],
    },
    streakAnalysis: {
      status: 'consistent',
      feedback: `You have studied for ${profile.streak} days. Consistency is the key to language mastery. Keep building this habit!`,
      motivation: 'Every session brings you closer to fluency! 🔥',
    },
    vocabularyInsights: {
      level: 'growing',
      count: profile.wordsLearned,
      feedback: `You have learned ${profile.wordsLearned} words. This is a solid foundation for communication. Continue expanding your vocabulary daily.`,
      recommendation: 'Learn 5-10 new words daily and review old ones using spaced repetition.',
    },
    topicAnalysis: {
      strongTopics: [],
      weakTopics: profile.weakTopics || [],
      feedback: profile.weakTopics.length > 0
        ? `Areas needing attention: ${profile.weakTopics.join(', ')}. Focus your next study sessions on these topics for maximum improvement.`
        : 'You show balanced performance across all topics! Great work maintaining consistency.',
    },
    personalInsights: {
      learningStyle: 'Steady, consistent learner',
      strengths: ['Regular study habit', 'Active vocabulary building'],
      growthAreas: ['Topic-specific practice', 'Accuracy improvement'],
    },
    priorityActions: [
      { priority: 1, action: 'Review weak vocabulary words', words: profile.weakWords.slice(0, 5).map(w => w.word || w), timeMinutes: 15 },
      { priority: 2, action: 'Practice weak topics with a quiz', words: [], timeMinutes: 20 },
      { priority: 3, action: 'Review today\'s learning', words: [], timeMinutes: 10 },
    ],
    motivationalClosing: 'Remember: Language learning is a marathon, not a sprint. Your consistent effort will lead to amazing results! 🌟 Keep going!',
  };
}

function generateFallbackAnalysis(profile) {
  const accuracy = profile.accuracy || 0;
  const streak = profile.streak || 0;
  const wordsLearned = profile.wordsLearned || 0;

  let accuracyLevel = 'beginner';
  let accuracyFeedback = `Your current accuracy is ${accuracy}%. This is a good starting point. With regular practice, you will see steady improvement.`;
  if (accuracy >= 85) {
    accuracyLevel = 'excellent';
    accuracyFeedback = `Outstanding! Your ${accuracy}% accuracy demonstrates excellent understanding of vocabulary and grammar. You are performing at an advanced level. To reach expert status, focus on nuanced usage, idiomatic expressions, and contextual variations.`;
  } else if (accuracy >= 70) {
    accuracyLevel = 'advanced';
    accuracyFeedback = `Great job! ${accuracy}% accuracy shows strong comprehension and solid foundational knowledge. You are ready for more challenging content. Focus on your weak areas to push above 85%.`;
  } else if (accuracy >= 55) {
    accuracyLevel = 'intermediate';
    accuracyFeedback = `Good progress! ${accuracy}% accuracy shows you are building a solid foundation. Additional targeted practice on challenging topics will significantly boost your score. Review incorrect answers carefully.`;
  }

  let streakStatus = 'building';
  let streakFeedback = `You have studied for ${streak} days. Starting a consistent study habit is the first step to language mastery.`;
  if (streak >= 10) {
    streakStatus = 'legendary';
    streakFeedback = `Exceptional! ${streak} consecutive days shows incredible dedication and discipline. This level of consistency is rare and will yield remarkable results. You are building a lifelong habit.`;
  } else if (streak >= 5) {
    streakStatus = 'dedicated';
    streakFeedback = `Great! ${streak} days in a row demonstrates real commitment. You are establishing a strong study routine that will serve you well.`;
  } else if (streak >= 2) {
    streakStatus = 'consistent';
    streakFeedback = `Good start! ${streak} days shows you are building momentum. Try to maintain this pace for at least 21 days to solidify the habit.`;
  }

  let vocabLevel = 'developing';
  let vocabFeedback = `You have learned ${wordsLearned} words so far.`;
  if (wordsLearned >= 200) {
    vocabLevel = 'impressive';
    vocabFeedback = `Impressive! ${wordsLearned} words puts you at an advanced intermediate level. This vocabulary size allows for fluent conversation on many topics. To reach advanced level, focus on collocations, phrasal verbs, and domain-specific terminology.`;
  } else if (wordsLearned >= 100) {
    vocabLevel = 'solid';
    vocabFeedback = `Solid! ${wordsLearned} words shows steady progress and a strong foundation. You can handle everyday conversations and are building toward fluency.`;
  } else if (wordsLearned >= 50) {
    vocabLevel = 'growing';
    vocabFeedback = `Growing! ${wordsLearned} words in your active vocabulary. You are making steady progress. Aim for 5-10 new words per day to reach 100 quickly.`;
  }

  return {
    greeting: '👋 Hello! Here is your personalized learning analysis.',
    overallSummary: `You have completed ${profile.quizzesCompleted} quizzes with ${accuracy}% accuracy over ${streak} days of study. Great effort building your English skills!`,
    accuracyAnalysis: {
      level: accuracyLevel,
      feedback: accuracyFeedback,
      tips: ['Practice 15-20 minutes daily for best results', 'Review incorrect answers to understand mistakes', 'Focus on one topic at a time before moving on', 'Use flashcards for vocabulary retention', 'Take regular quizzes to track progress'],
    },
    streakAnalysis: {
      status: streakStatus,
      feedback: streakFeedback,
      motivation: 'Every day you study, you get closer to mastery! The compound effect of daily practice is powerful. 🔥',
    },
    vocabularyInsights: {
      level: vocabLevel,
      count: wordsLearned,
      feedback: vocabFeedback,
      recommendation: 'Learn 5-10 new words daily and review old ones regularly using spaced repetition. Focus on words you encounter in real life.',
    },
    topicAnalysis: {
      strongTopics: [],
      weakTopics: profile.weakTopics || [],
      feedback: profile.weakTopics.length > 0
        ? `Focus areas: ${profile.weakTopics.join(', ')}. These topics showed lower accuracy in recent quizzes. Dedicate 2-3 study sessions to each weak topic for significant improvement.`
        : 'You show balanced performance across all topics! Great work maintaining consistency. Consider exploring new vocabulary areas to broaden your skills.',
    },
    personalInsights: {
      learningStyle: 'Consistent, goal-oriented learner',
      strengths: ['Regular study habit', 'Active vocabulary building', 'Willingness to practice'],
      growthAreas: profile.weakTopics.length > 0 ? profile.weakTopics.slice(0, 2) : ['Advanced vocabulary', 'Nuanced usage'],
    },
    priorityActions: [
      { priority: 1, action: 'Review weak vocabulary words', words: profile.weakWords.slice(0, 5).map(w => w.word || w), timeMinutes: 15 },
      { priority: 2, action: 'Practice weak topics with targeted quiz', words: [], timeMinutes: 20 },
      { priority: 3, action: 'Review recent learning materials', words: [], timeMinutes: 10 },
      { priority: 4, action: 'Set a daily study reminder', words: [], timeMinutes: 5 },
    ],
    motivationalClosing: 'Remember: Language learning is a marathon, not a sprint. Your consistent effort compounds over time into remarkable fluency! 🌟 Every word you learn brings you closer to your goals. Keep going - you are doing amazing!',
  };
}

module.exports = {
  generateAILearningAnalysis,
  generateFallbackAnalysis,
};