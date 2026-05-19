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

// Scenario-specific roleplay rules
const ROLEPLAY_SCENARIOS = {
  coffee: {
    role: 'Barista at a cozy café',
    setting: 'Coffee shop counter. You take drink orders.',
    menu: {
      drinks: ['Espresso', 'Americano', 'Latte', 'Cappuccino', 'Mocha', 'Iced Coffee'],
      sizes: ['Small (8oz)', 'Medium (12oz)', 'Large (16oz)'],
      milk: ['Whole milk', 'Oat milk', 'Soy milk', 'Almond milk'],
      extras: ['Extra shot (+$1)', 'Whipped cream (+$0.50)', 'Vanilla syrup (+$0.75)'],
    },
    intents: {
      menu: 'Provide a short menu listing drinks, sizes, and milk options. Format with bullet points.',
      size: 'List available sizes: small (8oz), medium (12oz), large (16oz).',
      milk: 'List milk options: whole, oat, soy, almond.',
      recommend: 'Recommend 1-2 popular drinks and briefly explain why.',
      order: 'Confirm the order, ask if they want any modifications.',
      price: 'Give approximate prices: espresso $3, latte $4.50, mocha $5.',
    },
  },
  restaurant: {
    role: 'Waiter at a casual restaurant',
    setting: 'Restaurant table. You take food orders and answer questions about the menu.',
    menu: {
      starters: ['Caesar Salad', 'Tomato Soup', 'Garlic Bread'],
      mains: ['Grilled Chicken', 'Beef Steak', 'Fish and Chips', 'Pasta Carbonara'],
      desserts: ['Chocolate Cake', 'Ice Cream', 'Fruit Salad'],
    },
    intents: {
      menu: 'Provide a short menu with starters, mains, and desserts. Use bullet points.',
      recommend: 'Recommend 1-2 popular dishes and briefly explain why.',
      order: 'Confirm the order, ask about side dishes or drink preferences.',
      allergy: 'Politely ask about allergies and reassure about ingredients.',
    },
  },
  airport: {
    role: 'Airport check-in agent',
    setting: 'Airport check-in counter. You handle passengers checking in for flights.',
    info: {
      baggage: 'Carry-on: 10kg. Checked: 20kg for economy, 30kg for business.',
      documents: 'Passport and ticket (digital or printed) are required.',
      gate: 'Gates are announced 30 minutes before departure.',
    },
    intents: {
      checkin: 'Ask for passport and ticket. Confirm flight details.',
      baggage: 'Explain baggage limits and ask if they want to check any bags.',
      seat: 'Ask about seat preference: window, aisle, or middle.',
    },
  },
  hotel: {
    role: 'Hotel receptionist',
    setting: 'Hotel front desk. You handle check-in, check-out, and guest requests.',
    info: {
      rooms: 'Single, Double, Twin, Suite. Breakfast included in some rates.',
      checkin: 'Check-in from 3 PM. Early check-in subject to availability.',
      checkout: 'Checkout by 11 AM. Late checkout available for $20.',
    },
    intents: {
      reservation: 'Ask for the name on the booking and confirm room type and dates.',
      checkin: 'Confirm room type, ask for ID, and explain breakfast and wifi.',
      checkout: 'Ask about room condition, process payment, and offer a taxi if needed.',
      breakfast: 'Breakfast is served 6 AM to 10 AM in the dining room.',
    },
  },
};

function buildRoleplayPrompt({ message, level, history, scenario }) {
  const normalizedLevel = normalizeLevel(level);
  const conversationHistory = Array.isArray(history) ? history : [];

  // scenario can be string or object
  const scenarioId = (scenario && typeof scenario === 'object') ? scenario.id : scenario;
  const scenarioData = ROLEPLAY_SCENARIOS[scenarioId] || ROLEPLAY_SCENARIOS.coffee;

  // Detect user intent
  const lowerMsg = (message || '').toLowerCase();
  let intentPrompt = '';

  if (lowerMsg.includes('menu') || lowerMsg.includes('list')) {
    intentPrompt = scenarioData.intents.menu
      ? `User is asking for the menu. ${scenarioData.intents.menu}`
      : 'User is asking for the menu. Provide a short list of options.';
  } else if (lowerMsg.includes('size') || lowerMsg.includes('sizes')) {
    intentPrompt = scenarioData.intents.size
      ? `User is asking about sizes. ${scenarioData.intents.size}`
      : 'User is asking about sizes. List available options.';
  } else if (lowerMsg.includes('milk') || lowerMsg.includes('cream')) {
    intentPrompt = scenarioData.intents.milk
      ? `User is asking about milk options. ${scenarioData.intents.milk}`
      : 'User is asking about milk options. List available types.';
  } else if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest')) {
    intentPrompt = scenarioData.intents.recommend
      ? `User is asking for a recommendation. ${scenarioData.intents.recommend}`
      : 'User is asking for a recommendation. Suggest 1-2 popular options.';
  } else if (lowerMsg.includes('order') || lowerMsg.includes('I would like') || lowerMsg.includes("I'd like") || lowerMsg.includes('can i get')) {
    intentPrompt = scenarioData.intents.order
      ? `User is placing an order. ${scenarioData.intents.order}`
      : 'User is placing an order. Confirm the order and ask if they want any modifications.';
  } else if (lowerMsg.includes('price') || lowerMsg.includes('how much') || lowerMsg.includes('cost')) {
    intentPrompt = scenarioData.intents.price
      ? `User is asking about prices. ${scenarioData.intents.price}`
      : 'User is asking about prices. Give approximate costs.';
  }

  return [
    'You are an English roleplay partner for Vietnamese learners.',
    '',
    `Your role: ${scenarioData.role}`,
    `Setting: ${scenarioData.setting}`,
    '',
    'STAY IN CHARACTER at all times. Do not explain grammar or break character.',
    'Respond naturally as the person in this scenario.',
    '',
    intentPrompt || 'Continue the conversation naturally.',
    '',
    `Learner level: ${normalizedLevel}`,
    '',
    'Conversation memory:',
    formatConversationHistory(conversationHistory),
    '',
    `Student message: ${String(message || '').trim()}`,
    '',
    'IMPORTANT: Reply as the roleplay character. Use natural dialogue, 2-4 short sentences, and keep the scene moving.',
    'If listing items (menu, sizes, options), use a short bullet list format.',
  ].join('\n');
}

module.exports = {
  LEVEL_GUIDANCE,
  SYSTEM_PROMPT,
  buildRoleplayPrompt,
  buildTutorPrompt,
  formatConversationHistory,
  ROLEPLAY_SCENARIOS,
};