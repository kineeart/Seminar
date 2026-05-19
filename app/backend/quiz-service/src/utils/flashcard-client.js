function resolveBaseUrl() {
  if (process.env.FLASHCARD_SERVICE_URL) {
    return process.env.FLASHCARD_SERVICE_URL;
  }
  if (process.env.FLASHCARD_SERVICE_PORT) {
    return `http://localhost:${process.env.FLASHCARD_SERVICE_PORT}`;
  }
  return 'http://localhost:3003';
}

async function fetchHistoryByUser(baseUrl, userId, limit, topic) {
  if (!userId) {
    return [];
  }

  try {
    const search = new URLSearchParams({
      userId: String(userId),
      limit: String(limit),
      requesterId: String(userId),
      requesterRole: 'user',
    });
    if (topic) {
      search.set('topic', String(topic));
    }

    const response = await fetch(`${baseUrl}/flashcards/history?${search.toString()}`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data.flashcards) ? data.flashcards : [];
  } catch (err) {
    return [];
  }
}

async function fetchFlashcardHistory({ userId, limit = 50, topic } = {}) {
  const baseUrl = resolveBaseUrl();
  if (!baseUrl) {
    return [];
  }

  const primaryUserId = userId ? String(userId) : '';
  return fetchHistoryByUser(baseUrl, primaryUserId, limit, topic);
}

module.exports = {
  fetchFlashcardHistory,
};
