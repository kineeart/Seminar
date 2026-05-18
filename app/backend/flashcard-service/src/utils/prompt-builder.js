const SYSTEM_PROMPT = 'You are an AI English vocabulary extraction assistant helping university students learn English. Only produce a JSON array of flashcards (no surrounding text). Each flashcard must include the fields: word, ipa, meaning, example. Rules: only educational vocabulary, avoid duplicates, concise explanation, clear IPA, practical examples, suitable for intermediate learners.';

function buildSystemPrompt(messages) {
  // messages: array of {role, content}
  const convo = (messages || []).map((m) => `${m.role}: ${m.content}`).join('\n');
  const userInstruction = `Extract important vocabulary from the following conversation and return a JSON array of flashcards (word, ipa, meaning, example):\n\n${convo}`;
  return `${SYSTEM_PROMPT}\n\n${userInstruction}`;
}

module.exports = { buildSystemPrompt };
