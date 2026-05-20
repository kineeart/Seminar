const store = require('../storage');
const { createError } = require('../utils/errors');

function createDefaultProgress(userId) {
  return {
    user_id: userId,
    learned_words_count: 0,
    flashcards_completed: 0,
    flashcards_correct: 0,
    flashcards_incorrect: 0,
    quiz_accuracy: 0,
    quizzes_completed: 0,
    quiz_correct_answers: 0,
    quiz_wrong_answers: 0,
    weak_topics: [],
    weak_words: [],
    word_mastery: {},
    total_study_seconds: 0,
    streak_days: 0,
    total_chat_sessions: 0,
    daily_activity: [],
    updated_at: new Date(),
  };
}

function updateDailyActivity(progress, dateKey, updates) {
  let existing = progress.daily_activity.find((entry) => entry.date_key === dateKey);

  if (!existing) {
    existing = {
      date_key: dateKey,
      chat_sessions: 0,
      messages_sent: 0,
      flashcards_reviewed: 0,
      quizzes_completed: 0,
      learned_words: 0,
      study_seconds: 0,
    };
    progress.daily_activity.push(existing);
  }

  Object.entries(updates).forEach(([key, value]) => {
    existing[key] = (existing[key] || 0) + value;
  });
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getPreviousDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return toDateKey(date);
}

function hasActivity(entry) {
  return Boolean(
    (entry.quizzes_completed || 0) > 0
    || (entry.flashcards_reviewed || 0) > 0
    || (entry.chat_sessions || 0) > 0
    || (entry.learned_words || 0) > 0
  );
}

function calculateStreak(dailyActivity) {
  if (!dailyActivity || !dailyActivity.length) {
    return 0;
  }

  const sorted = [...dailyActivity].sort((a, b) => b.date_key.localeCompare(a.date_key));
  let streak = 0;
  let currentKey = toDateKey(new Date());

  for (let index = 0; index < sorted.length; index += 1) {
    if (sorted[index].date_key !== currentKey) {
      break;
    }
    if (hasActivity(sorted[index])) {
      streak += 1;
    } else {
      break;
    }
    currentKey = getPreviousDateKey(currentKey);
  }

  return streak;
}

async function getProgress(userId) {
  if (!userId) {
    throw createError('VALIDATION_ERROR', 'userId is required');
  }

  let progress = await store.getProgress(userId);
  if (!progress) {
    progress = createDefaultProgress(userId);
    await store.saveProgress(progress);
  }

  return progress;
}

async function recordAttempt(attempt) {
  const userId = attempt.user_id;
  if (!userId) {
    return null;
  }

  let progress = await store.getProgress(userId);
  if (!progress) {
    progress = createDefaultProgress(userId);
  }

  const nextCompleted = progress.quizzes_completed + 1;
  const nextAccuracy = Math.round(
    (progress.quiz_accuracy * progress.quizzes_completed + attempt.score) / nextCompleted
  );

  const mergedWeakTopics = Array.from(
    new Set([...(progress.weak_topics || []), ...(attempt.weak_topics || [])])
  );
  const correctCount = Number(attempt.correct_count) || 0;
  const totalQuestions = Number(attempt.total_questions) || (attempt.answers || []).length || 0;

  const wrongAnswers = (attempt.answers || []).filter((a) => !a.is_correct);
  const correctAnswers = (attempt.answers || []).filter((a) => a.is_correct);
  const weakWordCounter = new Map((progress.weak_words || []).map((item) => [item.word, item.wrong_count]));
  const wordMastery = { ...(progress.word_mastery || {}) };

  wrongAnswers.forEach((answer) => {
    const word = String(answer.source_flashcard_word || '').trim().toLowerCase();
    if (!word) return;
    weakWordCounter.set(word, (weakWordCounter.get(word) || 0) + 1);
    const current = wordMastery[word] || { correct: 0, wrong: 0, mastery: 0, topic: answer.source_topic || null };
    current.wrong += 1;
    current.mastery = Math.max(0, Math.min(100, Math.round((current.correct / Math.max(1, current.correct + current.wrong)) * 100)));
    if (answer.source_topic) current.topic = answer.source_topic;
    wordMastery[word] = current;
  });

  correctAnswers.forEach((answer) => {
    const word = String(answer.source_flashcard_word || '').trim().toLowerCase();
    if (!word) return;
    const current = wordMastery[word] || { correct: 0, wrong: 0, mastery: 0, topic: answer.source_topic || null };
    current.correct += 1;
    current.mastery = Math.max(0, Math.min(100, Math.round((current.correct / Math.max(1, current.correct + current.wrong)) * 100)));
    if (answer.source_topic) current.topic = answer.source_topic;
    wordMastery[word] = current;
  });

  progress.quizzes_completed = nextCompleted;
  progress.quiz_accuracy = nextAccuracy;
  progress.quiz_correct_answers += correctCount;
  progress.quiz_wrong_answers += Math.max(0, totalQuestions - correctCount);
  progress.weak_topics = mergedWeakTopics.slice(0, 6);
  progress.word_mastery = wordMastery;
  progress.weak_words = Array.from(weakWordCounter.entries())
    .map(([word, wrong_count]) => ({ word, wrong_count }))
    .sort((a, b) => b.wrong_count - a.wrong_count)
    .slice(0, 30);
  const startedAt = attempt.started_at ? new Date(attempt.started_at) : null;
  const completedAt = attempt.completed_at ? new Date(attempt.completed_at) : new Date();
  const durationSeconds = startedAt && !Number.isNaN(startedAt.getTime())
    ? Math.max(0, Math.round((completedAt.getTime() - startedAt.getTime()) / 1000))
    : 0;
  progress.total_study_seconds += durationSeconds;
  const dateKey = new Date().toISOString().slice(0, 10);
  updateDailyActivity(progress, dateKey, { quizzes_completed: 1, study_seconds: durationSeconds });

  progress.streak_days = calculateStreak(progress.daily_activity);
  progress.updated_at = new Date();

  await store.saveProgress(progress);
  return progress;
}

async function recordFlashcardReview({ userId, reviewedAt }) {
  if (!userId) {
    throw createError('VALIDATION_ERROR', 'userId is required');
  }

  let progress = await store.getProgress(userId);
  if (!progress) {
    progress = createDefaultProgress(userId);
  }

  progress.flashcards_completed += 1;
  progress.learned_words_count += 1;
  progress.flashcards_correct += 1;

  const activityDate = reviewedAt ? new Date(reviewedAt) : new Date();
  const dateKey = toDateKey(activityDate);
  updateDailyActivity(progress, dateKey, {
    flashcards_reviewed: 1,
    learned_words: 1,
    study_seconds: 8,
  });

  progress.total_study_seconds += 8;

  progress.streak_days = calculateStreak(progress.daily_activity);
  progress.updated_at = new Date();

  await store.saveProgress(progress);
  return progress;
}

async function recordChatActivity({ userId, messageCount = 1, activityAt }) {
  if (!userId) {
    throw createError('VALIDATION_ERROR', 'userId is required');
  }

  let progress = await store.getProgress(userId);
  if (!progress) {
    progress = createDefaultProgress(userId);
  }

  progress.total_chat_sessions += 1;

  const activityDate = activityAt ? new Date(activityAt) : new Date();
  const dateKey = toDateKey(activityDate);
  updateDailyActivity(progress, dateKey, {
    chat_sessions: 1,
    messages_sent: Math.max(1, Number(messageCount) || 1),
  });

  progress.streak_days = calculateStreak(progress.daily_activity);
  progress.updated_at = new Date();

  await store.saveProgress(progress);
  return progress;
}

module.exports = {
  getProgress,
  recordAttempt,
  recordFlashcardReview,
  recordChatActivity,
  getRecommendations: async (userId) => {
    const progress = await getProgress(userId);
    const weakWords = (progress.weak_words || []).slice(0, 12).map((item) => item.word);
    const weakTopics = (progress.weak_topics || []).slice(0, 5);
    const lowMasteryWords = Object.entries(progress.word_mastery || {})
      .map(([word, data]) => ({ word, mastery: data.mastery || 0, topic: data.topic || null }))
      .filter((item) => item.mastery < 60)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 12);

    const nextQuizTopic = weakTopics[0] || (lowMasteryWords[0] && lowMasteryWords[0].topic) || 'general';
    return {
      review_words: Array.from(new Set([...weakWords, ...lowMasteryWords.map((w) => w.word)])).slice(0, 15),
      weak_flashcards: lowMasteryWords,
      next_quiz: {
        topic: nextQuizTopic || 'general',
        difficulty: progress.quiz_accuracy >= 80 ? 'medium' : 'easy',
        count: 10,
      },
    };
  },
};

