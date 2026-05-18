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

  progress.quizzes_completed = nextCompleted;
  progress.quiz_accuracy = nextAccuracy;
  progress.weak_topics = mergedWeakTopics.slice(0, 6);
  const dateKey = new Date().toISOString().slice(0, 10);
  updateDailyActivity(progress, dateKey, { quizzes_completed: 1 });

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

  const activityDate = reviewedAt ? new Date(reviewedAt) : new Date();
  const dateKey = toDateKey(activityDate);
  updateDailyActivity(progress, dateKey, {
    flashcards_reviewed: 1,
    learned_words: 1,
  });

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
};

