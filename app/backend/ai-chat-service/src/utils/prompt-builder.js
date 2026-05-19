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

// ─── Tutor Prompt (normal teaching mode) ────────────────────────────────────────

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

// ─── Flashcard Prompt (dedicated prompt for flashcard generation) ────────────────

const FLASHCARD_SYSTEM_PROMPT = [
  'You are a vocabulary flashcard generator for Vietnamese university students learning English (TOEIC/IELTS/VSTEP).',
  '',
  'YOUR ONLY JOB: Generate vocabulary flashcards in a specific JSON format.',
  '',
  'OUTPUT FORMAT — YOU MUST FOLLOW THIS EXACTLY:',
  '1. Write a brief introduction in Vietnamese (1-2 sentences max).',
  '2. Then output a code block with the language tag "flashcards" containing a JSON array.',
  '',
  'EXAMPLE OUTPUT:',
  'Đây là các từ vựng về chủ đề công việc:',
  '',
  '```flashcards',
  '[',
  '  {"word": "productivity", "ipa": "/ˌprɒdʌkˈtɪvɪti/", "meaning": "năng suất", "example": "We need to improve our productivity."},',
  '  {"word": "deadline", "ipa": "/ˈdedlaɪn/", "meaning": "hạn chót", "example": "The deadline is next Friday."}',
  ']',
  '```',
  '',
  'RULES:',
  '- You MUST include the ```flashcards code block. This is NOT optional.',
  '- The JSON must be a valid array of objects.',
  '- Each object MUST have exactly 4 fields: "word", "ipa", "meaning", "example".',
  '- "meaning" MUST be in Vietnamese.',
  '- "ipa" MUST be valid IPA pronunciation enclosed in slashes.',
  '- "example" MUST be a natural English sentence using the word.',
  '- Default: generate 15 flashcards. If user specifies a number, generate that many.',
  '- Do NOT output anything after the ```flashcards block.',
  '- Do NOT use markdown formatting (bold, italic) inside the JSON values.',
  '- If you skip the ```flashcards block, THE SYSTEM WILL FAIL.',
].join('\n');

function buildFlashcardPrompt({ message, level, history }) {
  const normalizedLevel = normalizeLevel(level);
  const conversationHistory = Array.isArray(history) ? history : [];

  return [
    FLASHCARD_SYSTEM_PROMPT,
    '',
    `Student level: ${normalizedLevel}`,
    '',
    'Conversation context:',
    formatConversationHistory(conversationHistory),
    '',
    `Student request: ${String(message || '').trim()}`,
    '',
    'NOW generate the flashcards. Remember: you MUST include ```flashcards [...] ``` in your response.',
  ].join('\n');
}

// ─── Flashcard Request Detection ────────────────────────────────────────────────

function isFlashcardRequest(message) {
  if (!message || typeof message !== 'string') return false;
  const keywords = [
    'flashcard', 'tạo flashcard', 'tạo từ vựng', 'cho tôi flashcard', 'create flashcard',
    'tạo từ', 'cho tôi từ vựng', 'tạo vocabulary', 'generate flashcard',
    'tạo ít nhất', 'tạo cho tôi', 'cho tôi từ', 'tạo thêm',
  ];
  const lower = message.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

// ─── Roleplay Scenarios with Goals ─────────────────────────────────────────────

const ROLEPLAY_SCENARIOS = {
  coffee: {
    id: 'coffee',
    title: 'Cafe Counter',
    subtitle: 'Order Drinks',
    role: 'Barista at a cozy café',
    setting: 'Coffee shop counter. You take drink orders, suggest options, and process payment.',
    greeting: 'Good morning! Welcome in. What can I get started for you today?',
    goal: 'Successfully order a drink (choose drink, size, and milk option), then pay.',
    goalSteps: ['choose_drink', 'choose_size', 'confirm_order', 'pay'],
    goalKeywords: {
      choose_drink: ['latte', 'espresso', 'americano', 'cappuccino', 'mocha', 'coffee', 'tea'],
      choose_size: ['small', 'medium', 'large', 'regular'],
      confirm_order: ['yes', 'correct', "that's right", 'perfect', 'sounds good'],
      pay: ['card', 'cash', 'pay', 'here you go', 'thank you', 'thanks'],
    },
    completionMessage: '🎉 **Scenario Complete!** You successfully ordered a drink at the café. Great job using ordering vocabulary and polite expressions!',
  },
  food: {
    id: 'food',
    title: 'Restaurant',
    subtitle: 'Order Food',
    role: 'Waiter at a casual restaurant',
    setting: 'Restaurant table. You greet guests, present the menu, take food orders, and handle requests.',
    greeting: 'Good evening! Welcome to The Garden Bistro. Can I start you off with something to drink, or would you like to see the menu?',
    goal: 'Successfully order a full meal (starter or main + drink), handle any questions, then ask for the bill.',
    goalSteps: ['view_menu', 'order_food', 'confirm_order', 'ask_bill'],
    goalKeywords: {
      view_menu: ['menu', 'see', 'what do you have', 'options', 'specials'],
      order_food: ["i'd like", "i'll have", 'can i get', 'order', 'please', 'chicken', 'steak', 'fish', 'pasta', 'salad', 'soup'],
      confirm_order: ['yes', 'correct', "that's all", 'nothing else', 'perfect'],
      ask_bill: ['bill', 'check', 'pay', 'how much', 'total'],
    },
    completionMessage: '🎉 **Scenario Complete!** You successfully ordered a meal at a restaurant. Excellent use of polite requests and food vocabulary!',
  },
  airport: {
    id: 'airport',
    title: 'At the Airport',
    subtitle: 'Check-in & Board',
    role: 'Airport check-in agent',
    setting: 'Airport check-in counter. You handle passenger check-in, baggage, seat selection, and boarding passes.',
    greeting: 'Good morning! Welcome to Sky Airlines check-in. May I see your passport and booking confirmation, please?',
    goal: 'Successfully check in for your flight (show documents, check baggage, choose seat, get boarding pass).',
    goalSteps: ['show_documents', 'check_baggage', 'choose_seat', 'get_boarding_pass'],
    goalKeywords: {
      show_documents: ['passport', 'here', 'booking', 'confirmation', 'ticket'],
      check_baggage: ['bag', 'luggage', 'suitcase', 'check', 'carry-on', 'kg'],
      choose_seat: ['window', 'aisle', 'seat', 'prefer', 'middle'],
      get_boarding_pass: ['boarding pass', 'gate', 'thank', 'thanks', 'have a good flight'],
    },
    completionMessage: '🎉 **Scenario Complete!** You successfully checked in at the airport. Great job with travel vocabulary and formal requests!',
  },
  hotel: {
    id: 'hotel',
    title: 'Hotel',
    subtitle: 'Book & Check-in',
    role: 'Hotel receptionist',
    setting: 'Hotel front desk. You handle reservations, check-in, room info, and guest requests.',
    greeting: 'Good afternoon! Welcome to The Grand Hotel. Do you have a reservation, or would you like to book a room?',
    goal: 'Successfully check into the hotel (confirm reservation, provide ID, get room key, ask about facilities).',
    goalSteps: ['confirm_reservation', 'provide_id', 'get_room_key', 'ask_facilities'],
    goalKeywords: {
      confirm_reservation: ['reservation', 'booking', 'booked', 'name', 'yes i have'],
      provide_id: ['passport', 'id', 'here', 'identification'],
      get_room_key: ['key', 'room', 'floor', 'thank', 'thanks'],
      ask_facilities: ['wifi', 'breakfast', 'pool', 'gym', 'restaurant', 'checkout', 'time'],
    },
    completionMessage: '🎉 **Scenario Complete!** You successfully checked into the hotel. Well done with hospitality vocabulary and polite conversation!',
  },
};

function detectGoalProgress(scenario, message, history) {
  const scenarioData = ROLEPLAY_SCENARIOS[scenario];
  if (!scenarioData) return { completedSteps: [], isComplete: false };

  const allMessages = [
    ...(history || []).filter(m => m.role === 'user').map(m => m.content),
    message,
  ].join(' ').toLowerCase();

  const completedSteps = [];
  for (const step of scenarioData.goalSteps) {
    const keywords = scenarioData.goalKeywords[step] || [];
    const matched = keywords.some(kw => allMessages.includes(kw));
    if (matched) completedSteps.push(step);
  }

  const isComplete = completedSteps.length >= scenarioData.goalSteps.length;
  return { completedSteps, isComplete, totalSteps: scenarioData.goalSteps.length };
}

function buildRoleplayPrompt({ message, level, history, scenario }) {
  const normalizedLevel = normalizeLevel(level);
  const conversationHistory = Array.isArray(history) ? history : [];

  const scenarioId = (scenario && typeof scenario === 'object') ? scenario.id : scenario;
  const scenarioData = ROLEPLAY_SCENARIOS[scenarioId] || ROLEPLAY_SCENARIOS.coffee;

  // Detect goal progress
  const progress = detectGoalProgress(scenarioId || 'coffee', message, conversationHistory);

  let goalInstruction = '';
  if (progress.isComplete) {
    goalInstruction = [
      '',
      'GOAL COMPLETED! The student has achieved all steps.',
      'After your natural reply, add this EXACT line at the end:',
      '[GOAL_COMPLETE]',
      '',
    ].join('\n');
  } else {
    goalInstruction = [
      '',
      `Goal: ${scenarioData.goal}`,
      `Steps remaining: ${scenarioData.goalSteps.filter(s => !progress.completedSteps.includes(s)).join(', ')}`,
      'Guide the conversation naturally toward the next uncompleted step.',
      '',
    ].join('\n');
  }

  return [
    'You are an English roleplay partner for Vietnamese learners.',
    '',
    `Your role: ${scenarioData.role}`,
    `Setting: ${scenarioData.setting}`,
    goalInstruction,
    'RULES:',
    '- STAY IN CHARACTER at all times. Never break character or explain grammar.',
    '- Respond naturally as the character in this scenario.',
    '- Keep replies SHORT: 2-4 sentences max.',
    '- If listing items (menu, options), use a short bullet list.',
    '- Gently guide the student toward completing the goal steps.',
    '- Be patient and helpful if the student makes mistakes.',
    '',
    `Learner level: ${normalizedLevel}`,
    '',
    'Conversation so far:',
    formatConversationHistory(conversationHistory),
    '',
    `Student says: ${String(message || '').trim()}`,
  ].join('\n');
}

module.exports = {
  LEVEL_GUIDANCE,
  SYSTEM_PROMPT,
  FLASHCARD_SYSTEM_PROMPT,
  ROLEPLAY_SCENARIOS,
  buildRoleplayPrompt,
  buildTutorPrompt,
  buildFlashcardPrompt,
  formatConversationHistory,
  detectGoalProgress,
  isFlashcardRequest,
};
