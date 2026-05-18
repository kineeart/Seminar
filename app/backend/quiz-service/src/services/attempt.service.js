const store = require('../storage');
const { createError } = require('../utils/errors');

async function listAttempts({ userId, quizId }) {
  if (!userId) {
    throw createError('VALIDATION_ERROR', 'userId is required');
  }

  return store.listAttempts({ userId, quizId });
}

module.exports = {
  listAttempts,
};
