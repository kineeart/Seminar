const crypto = require('crypto');

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function hashQuestion(question) {
  const base = [
    normalizeValue(question.type),
    normalizeValue(question.question),
    normalizeValue(question.correct_answer),
  ].join('|');

  return crypto.createHash('sha256').update(base).digest('hex');
}

function dedupeQuestions(questions, existingHashes = new Set()) {
  const unique = [];
  const hashes = new Set(existingHashes);

  (questions || []).forEach((question) => {
    const hash = hashQuestion(question);
    if (hashes.has(hash)) {
      return;
    }
    hashes.add(hash);
    unique.push(question);
  });

  return { questions: unique, hashes };
}

module.exports = {
  hashQuestion,
  dedupeQuestions,
};
