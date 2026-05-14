const { normalizeLevel } = require('./chat-validator');

const LEVEL_GUIDANCE = {
  Beginner: {
    teachingStyle: 'Use very simple English, short sentences, and one idea at a time.',
    explanationDepth: 'Explain the core idea in plain language. Avoid jargon unless it is defined immediately.',
    exampleGuidance: 'Give one short example sentence and one quick takeaway.',
  },
  Intermediate: {
    teachingStyle: 'Use clear English with moderate detail and a friendly tone.',
    explanationDepth: 'Explain the concept clearly, include the reason behind it, and keep the answer compact.',
    exampleGuidance: 'Give one or two examples and briefly mention common mistakes.',
  },
  Advanced: {
    teachingStyle: 'Use concise but precise English with accurate grammar terminology.',
    explanationDepth: 'Provide a sharper explanation, note edge cases, and avoid unnecessary padding.',
    exampleGuidance: 'Give a compact example and mention subtle distinctions when useful.',
  },
};

const SYSTEM_PROMPT = [
  'You are an AI English Tutor helping university students learn English.',
  '',
  'Your teaching style:',
  '* friendly',
  '* concise',
  '* educational',
  '* easy to understand',
  '* supportive',
  '* beginner-friendly when needed',
  '',
  'You help with:',
  '* grammar',
  '* vocabulary',
  '* conversation',
  '* writing',
  '* pronunciation explanations',
  '',
  'Core rules:',
  '- explain clearly',
  '- avoid overly academic wording',
  '- provide examples',
  '- encourage learners',
  '- remain concise',
].join('\n');

function formatConversationHistory(history) {
  if (!history.length) {
    return 'No previous conversation yet.';
  }

  return history.map((message, index) => {
    const speaker = message.role === 'assistant' ? 'Tutor' : 'Student';
    return `${index + 1}. ${speaker}: ${message.content}`;
  }).join('\n');
}

function buildTutorPrompt({ message, level, history }) {
  const normalizedLevel = normalizeLevel(level);
  const guidance = LEVEL_GUIDANCE[normalizedLevel];
  const conversationHistory = Array.isArray(history) ? history : [];

  return [
    SYSTEM_PROMPT,
    '',
    `Learner level: ${normalizedLevel}`,
    `Teaching style: ${guidance.teachingStyle}`,
    `Explanation depth: ${guidance.explanationDepth}`,
    `Example guidance: ${guidance.exampleGuidance}`,
    '',
    'Conversation memory:',
    formatConversationHistory(conversationHistory),
    '',
    `Current user message: ${String(message || '').trim()}`,
    '',
    'Reply requirements:',
    '- answer in a supportive tutor voice',
    '- keep the response concise and educational',
    '- include a grammar explanation, vocabulary support, or an example if useful',
    '- adjust depth to the learner level',
  ].join('\n');
}

module.exports = {
  LEVEL_GUIDANCE,
  SYSTEM_PROMPT,
  buildTutorPrompt,
  formatConversationHistory,
};
