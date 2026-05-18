const axios = require('axios');

function getQuizServiceBaseUrl() {
  return process.env.QUIZ_SERVICE_URL || 'http://localhost:5004';
}

async function recordFlashcardReview({ userId, reviewedAt }) {
  if (!userId) {
    return null;
  }

  const response = await axios.post(
    `${getQuizServiceBaseUrl()}/progress/flashcard-review`,
    { userId, reviewedAt },
    {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
    },
  );

  return response.data?.progress || null;
}

module.exports = {
  recordFlashcardReview,
};
