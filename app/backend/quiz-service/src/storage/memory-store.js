const quizzes = new Map();
const attempts = [];
const progressByUser = new Map();

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

module.exports = {
  createQuiz,
  getQuiz,
  createAttempt,
  listAttempts,
  getProgress,
  saveProgress,
};
