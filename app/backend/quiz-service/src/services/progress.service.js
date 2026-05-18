const store = require('../storage');
const { createError } = require('../utils/errors');

function createDefaultProgress(userId) {
  return {
    user_id: userId,
    learned_words_count: 0,
    flashcards_completed: 0,
    quiz_accuracy: 0,
    quizzes_completed: 0,
    weak_topics: [],
    streak_days: 0,
    total_chat_sessions: 0,
    daily_activity: [],
    updated_at: new Date().toISOString(),
  };
}

function updateDailyActivity(progress, dateKey, delta) {
  const existing = progress.daily_activity.find((entry) => entry.date_key === dateKey);
  if (existing) {
    existing.quizzes_completed += delta;
    return;
  }

  progress.daily_activity.push({
    date_key: dateKey,
    chat_sessions: 0,
    messages_sent: 0,
    flashcards_reviewed: 0,
    quizzes_completed: delta,
    learned_words: 0,
  });
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

  progress.quizzes_completed = nextCompleted;
  progress.quiz_accuracy = nextAccuracy;
  progress.weak_topics = mergedWeakTopics.slice(0, 6);
  progress.updated_at = new Date().toISOString();

  const dateKey = new Date().toISOString().slice(0, 10);
  updateDailyActivity(progress, dateKey, 1);

  await store.saveProgress(progress);
  return progress;
}

module.exports = {
  getProgress,
  recordAttempt,
};
