/**
 * Flashcard Service Client
 * HTTP client for ai-chat-service to call flashcard-service internally.
 * Non-blocking: errors are logged but never break the chat flow.
 */

const FLASHCARD_SERVICE_URL = process.env.FLASHCARD_SERVICE_URL || 'http://localhost:3003';
const TIMEOUT_MS = 5000;

/**
 * Save flashcards by calling flashcard-service POST /batch.
 * Returns array of saved flashcards on success, empty array on failure.
 */
async function saveFlashcards({ userId, conversationId, flashcards }) {
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return [];
  }

  try {
    const response = await fetch(`${FLASHCARD_SERVICE_URL}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        conversationId,
        source: 'chat-inline',
        flashcards,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(JSON.stringify({
        event: 'flashcard_client_error',
        status: response.status,
        userId,
        conversationId,
      }));
      return [];
    }

    const data = await response.json();
    return data.saved || [];
  } catch (err) {
    console.warn(JSON.stringify({
      event: 'flashcard_client_failure',
      message: err.message,
      userId,
      conversationId,
    }));
    return [];
  }
}

module.exports = {
  saveFlashcards,
  /**
   * Fallback generation via flashcard-service when AI reply did not include inline marker.
   * Returns generated flashcards or [] on failure.
   */
  generateFlashcardsFromMessage: async ({ userId, conversationId, message }) => {
    if (!message || !String(message).trim()) {
      return [];
    }

    try {
      const response = await fetch(`${FLASHCARD_SERVICE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId || `chat_${Date.now()}`,
          userId: userId || undefined,
          messages: [{ role: 'user', content: String(message).trim() }],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        console.warn(JSON.stringify({
          event: 'flashcard_generate_fallback_error',
          status: response.status,
          userId,
          conversationId,
        }));
        return [];
      }

      const data = await response.json();
      return Array.isArray(data.flashcards) ? data.flashcards : [];
    } catch (err) {
      console.warn(JSON.stringify({
        event: 'flashcard_generate_fallback_failure',
        message: err.message,
        userId,
        conversationId,
      }));
      return [];
    }
  },
};
