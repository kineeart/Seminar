const fs = require('fs/promises');
const path = require('path');

const DEFAULT_DIR = path.resolve(__dirname, '../../data');

function resolveQuizSnapshotPath(quizId) {
  if (!quizId) {
    throw new Error('quizId is required to save snapshot');
  }

  const baseDir = process.env.QUIZ_JSON_DIR || DEFAULT_DIR;
  const fileName = `quiz-${quizId}.json`;
  return path.join(baseDir, fileName);
}

async function writeQuizSnapshot(quiz) {
  const quizId = quiz && (quiz.id || quiz._id);
  const filePath = resolveQuizSnapshotPath(quizId);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(quiz, null, 2), 'utf8');
  return filePath;
}

module.exports = {
  resolveQuizSnapshotPath,
  writeQuizSnapshot,
};
