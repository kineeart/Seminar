function resolveBaseUrl() {
  if (process.env.FLASHCARD_SERVICE_URL) {
    return process.env.FLASHCARD_SERVICE_URL;
  }
  if (process.env.FLASHCARD_SERVICE_PORT) {
    return `http://localhost:${process.env.FLASHCARD_SERVICE_PORT}`;
  }
  return 'http://localhost:3003';
}

async function fetchHistoryByUser(baseUrl, userId, limit) {
  if (!userId) {
    return [];
  }

  try {
    const search = new URLSearchParams({
      userId: String(userId),
      limit: String(limit),
    });

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

async function fetchFlashcardHistory({ userId, limit = 50 } = {}) {
  const baseUrl = resolveBaseUrl();
  if (!baseUrl) {
    return [];
  }

  const primaryUserId = userId ? String(userId) : '';
  const primaryCards = await fetchHistoryByUser(baseUrl, primaryUserId, limit);
  if (primaryCards.length > 0) {
    return primaryCards;
  }

  if (primaryUserId && primaryUserId !== 'guest') {
    const guestCards = await fetchHistoryByUser(baseUrl, 'guest', limit);
    if (guestCards.length > 0) {
      return guestCards;
    }
  }

  return primaryCards;
}

module.exports = {
  fetchFlashcardHistory,
};
