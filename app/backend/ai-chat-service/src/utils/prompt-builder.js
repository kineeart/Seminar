const { normalizeLevel } = require('./chat-validator');

const LEVEL_GUIDANCE = {
  Beginner: {
    teachingStyle: 'Dùng tiếng Việt đơn giản, kèm ví dụ tiếng Anh dễ hiểu.',
    explanationDepth: 'Giải thích ý chính bằng ngôn ngữ đơn giản. Cho công thức rõ ràng.',
    exampleGuidance: 'Cho 2-3 ví dụ ngắn, highlight từ khóa bằng bold.',
  },
  Intermediate: {
    teachingStyle: 'Giải thích rõ ràng, có chiều sâu vừa phải, kèm ví dụ thực tế.',
    explanationDepth: 'Giải thích concept + lý do + lỗi thường gặp.',
    exampleGuidance: 'Cho 2-3 ví dụ, chỉ ra lỗi sai phổ biến.',
  },
  Advanced: {
    teachingStyle: 'Giải thích chính xác với thuật ngữ ngữ pháp, ngắn gọn nhưng đầy đủ.',
    explanationDepth: 'Phân tích sâu, nêu edge cases và sự khác biệt tinh tế.',
    exampleGuidance: 'Ví dụ nâng cao, so sánh các cấu trúc tương tự.',
  },
};

const SYSTEM_PROMPT = [
  'You are an expert AI English Tutor for Vietnamese university students (TOEIC/IELTS/VSTEP).',
  '',
  'RESPONSE STYLE:',
  '- Use markdown: **bold** for key terms/rules, *italic* for example sentences.',
  '- Use line breaks between sections for readability.',
  '- Keep answers FOCUSED: 8-15 sentences for grammar/vocab topics.',
  '- For big topics, cover the MAIN rule + examples. Do NOT write a full textbook chapter.',
  '',
  'FORMAT for grammar questions:',
  '**Công thức:** S + V + adj-er + than / S + V + more + adj + than',
  '',
  '**Ví dụ:**',
  '- *She is **taller than** her sister.*',
  '- *This book is **more interesting than** that one.*',
  '',
  '**Lưu ý:** Không dùng "more" với tính từ ngắn (❌ more tall → ✅ taller)',
  '',
  'LENGTH CONTROL:',
  '- Greetings/simple questions: 1-2 sentences.',
  '- Grammar/vocab: Cover 1-2 main rules + 2-3 examples + 1 note. MAX 15 sentences total.',
  '- Do NOT list every irregular form. Do NOT write 4+ sections.',
  '',
  'LANGUAGE:',
  '- Student writes Vietnamese → reply Vietnamese + English examples.',
  '- Student writes English → reply English.',
  '',
  'TONE: Friendly, knowledgeable, concise. Like a smart tutor, not a textbook.',
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
    `Student message: ${String(message || '').trim()}`,
    '',
    'IMPORTANT: Keep your reply between 5-15 sentences. Use **bold** and *italic*. Do not exceed 15 sentences.',
  ].join('\n');
}

function buildRoleplayPrompt({ message, level, history, scenario }) {
  const normalizedLevel = normalizeLevel(level);
  const conversationHistory = Array.isArray(history) ? history : [];
  const scenarioText = scenario || 'General everyday conversation roleplay.';

  return [
    'You are an English roleplay partner for Vietnamese learners.',
    'Stay in character and respond as the other person in the scenario.',
    'Do not explain grammar unless the learner asks for it.',
    'Keep replies natural and situation-specific.',
    'After each reply, add one short follow-up question or prompt to continue the conversation.',
    '',
    `Learner level: ${normalizedLevel}`,
    `Scenario: ${scenarioText}`,
    '',
    'Conversation memory:',
    formatConversationHistory(conversationHistory),
    '',
    `Student message: ${String(message || '').trim()}`,
    '',
    'IMPORTANT: Reply as the roleplay character. Use natural dialogue, 2-4 short sentences, and keep the scene moving.',
  ].join('\n');
}

module.exports = {
  LEVEL_GUIDANCE,
  SYSTEM_PROMPT,
  buildRoleplayPrompt,
  buildTutorPrompt,
  formatConversationHistory,
};
