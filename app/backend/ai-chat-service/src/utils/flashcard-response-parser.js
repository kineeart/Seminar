/**
 * Flashcard Response Parser
 * Extracts and validates flashcard JSON from AI responses.
 * Flashcards are embedded in responses using ```flashcards ... ``` markers.
 */

const FLASHCARD_MARKER_REGEX = /```flashcards\s*\n([\s\S]*?)```/g;

/**
 * Validate a single flashcard object.
 * Must have all 4 required non-empty string fields: word, ipa, meaning, example.
 */
function validateFlashcard(obj) {
  if (!obj || typeof obj !== 'object') return false;

  const requiredFields = ['word', 'ipa', 'meaning', 'example'];
  return requiredFields.every((field) => {
    const value = obj[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

/**
 * Extract flashcards from an AI response string.
 * Finds all ```flashcards ... ``` marker blocks, parses JSON, validates each card.
 * Returns { cleanReply, flashcards } where:
 *   - cleanReply: the response with all marker blocks removed
 *   - flashcards: array of valid flashcard objects
 */
function extractFlashcards(aiResponse) {
  if (!aiResponse || typeof aiResponse !== 'string') {
    return { cleanReply: aiResponse || '', flashcards: [] };
  }

  // Check if any marker exists
  if (!aiResponse.includes('```flashcards')) {
    return { cleanReply: aiResponse, flashcards: [] };
  }

  const flashcards = [];

  // Extract JSON from all marker blocks
  let match;
  const regex = new RegExp(FLASHCARD_MARKER_REGEX.source, FLASHCARD_MARKER_REGEX.flags);
  while ((match = regex.exec(aiResponse)) !== null) {
    const jsonStr = match[1].trim();
    try {
      const parsed = JSON.parse(jsonStr);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (validateFlashcard(item)) {
          flashcards.push({
            word: item.word.trim(),
            ipa: item.ipa.trim(),
            meaning: item.meaning.trim(),
            example: item.example.trim(),
          });
        }
      }
    } catch (_err) {
      // Malformed JSON — skip this block
    }
  }

  // Remove all marker blocks from the reply
  const cleanReply = aiResponse
    .replace(new RegExp(FLASHCARD_MARKER_REGEX.source, FLASHCARD_MARKER_REGEX.flags), '')
    .trim();

  return { cleanReply, flashcards };
}

module.exports = {
  extractFlashcards,
  validateFlashcard,
};
