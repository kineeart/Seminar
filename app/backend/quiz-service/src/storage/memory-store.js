const quizzes = new Map();
const attempts = [];
const progressByUser = new Map();
const aiQuizLogs = [];

async function createQuiz(quiz) {
  quizzes.set(quiz.id, quiz);
  return quiz;
}

async function getQuiz(quizId) {
  return quizzes.get(quizId) || null;
}

async function createAttempt(attempt) {
  attempts.push(attempt);
  return attempt;
}

async function listAttempts({ userId, quizId } = {}) {
  return attempts.filter((attempt) => {
    if (userId && attempt.user_id !== userId) {
      return false;
    }
    if (quizId && attempt.quiz_id !== quizId) {
      return false;
    }
    return true;
  });
}

async function getProgress(userId) {
  return progressByUser.get(userId) || null;
}

async function saveProgress(progress) {
  progressByUser.set(progress.user_id, progress);
  return progress;
}

async function createAiQuizLog(log) {
  aiQuizLogs.push(log);
  return log;
}

async function listRecentQuestions({ userId, limit = 100 } = {}) {
  if (!userId) {
    return [];
  }

  const items = Array.from(quizzes.values())
    .filter((quiz) => quiz.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const questions = [];
  items.forEach((quiz) => {
    (quiz.questions || []).forEach((question) => {
      questions.push(question);
    });
  });

  return questions.slice(0, Math.max(1, Number(limit) || 100));
}

module.exports = {
  createQuiz,
  getQuiz,
  createAttempt,
  listAttempts,
  getProgress,
  saveProgress,
  createAiQuizLog,
  listRecentQuestions,
};
