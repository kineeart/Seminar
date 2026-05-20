/**
 * Analysis Service - Calls LLM to generate learning analysis.
 * Same pattern as ai-chat-service but dedicated to analysis.
 */

const FLASHCARD_SERVICE_URL = process.env.FLASHCARD_SERVICE_URL || 'http://localhost:3003';
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://llm.chiasegpu.vn/v1';
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-5.5';

const ANALYSIS_PROMPT = `You are an AI learning analyst for a Vietnamese student studying English (TOEIC/IELTS).
Analyze the student's learning data and return a JSON object with this EXACT structure:

{
  "greeting": "A friendly greeting",
  "overallSummary": "1-2 sentence summary of their progress",
  "accuracyAnalysis": {
    "level": "beginner|intermediate|advanced",
    "feedback": "Feedback on their accuracy",
    "tips": ["tip1", "tip2"]
  },
  "streakAnalysis": {
    "status": "building|strong|needs-work",
    "feedback": "Feedback on study consistency",
    "motivation": "A motivational sentence"
  },
  "vocabularyInsights": {
    "count": 0,
    "feedback": "Feedback on vocabulary progress",
    "recommendation": "What to study next"
  },
  "topicAnalysis": {
    "feedback": "Analysis of topics studied",
    "weakTopics": ["topic1", "topic2"]
  },
  "priorityActions": [
    { "action": "What to do", "timeMinutes": 10 }
  ],
  "motivationalClosing": "An encouraging closing message"
}

RULES:
- Return ONLY valid JSON, no markdown, no extra text.
- All text should be in Vietnamese.
- Be encouraging and specific.`;

async function fetchUserData(userId) {
  try {
    const resp = await fetch(`${FLASHCARD_SERVICE_URL}/history?userId=${encodeURIComponent(userId)}&limit=100`, {
      signal: AbortSignal.timeout(5000),
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.flashcards || [];
    }
  } catch { /* ignore */ }
  return [];
}

async function callLLM(prompt) {
  if (!LLM_API_KEY || !LLM_BASE_URL) {
    return null;
  }

  const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LLM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: ANALYSIS_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    throw new Error(`LLM error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';
  // Strip think tags if present
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

function buildFallbackAnalysis(flashcards) {
  const total = flashcards.length;
  const reviewed = flashcards.filter(fc => fc.reviewed_at).length;
  const chatCards = flashcards.filter(fc => fc.source === 'chat-inline').length;

  return {
    greeting: '👋 Xin chào!',
    overallSummary: `Bạn đã học ${total} từ vựng, trong đó ${reviewed} từ đã ôn tập.`,
    accuracyAnalysis: {
      level: total > 20 ? 'intermediate' : 'beginner',
      feedback: `Bạn có ${total} flashcard trong thư viện. ${reviewed > 0 ? `Đã ôn tập ${reviewed} từ.` : 'Hãy bắt đầu ôn tập!'}`,
      tips: ['Ôn tập mỗi ngày 10-15 phút', 'Tập trung vào từ chưa thuộc'],
    },
    streakAnalysis: {
      status: 'building',
      feedback: 'Hãy duy trì thói quen học mỗi ngày để tạo streak!',
      motivation: '🔥 Mỗi ngày một ít, tiến bộ sẽ đến!',
    },
    vocabularyInsights: {
      count: total,
      feedback: `${chatCards} từ từ chat, ${total - chatCards} từ từ nguồn khác.`,
      recommendation: 'Thử tạo flashcard về chủ đề mới trong chat!',
    },
    topicAnalysis: {
      feedback: 'Tiếp tục mở rộng vốn từ qua nhiều chủ đề khác nhau.',
      weakTopics: ['Business', 'Travel', 'Technology'],
    },
    priorityActions: [
      { action: 'Ôn tập flashcard hiện có', timeMinutes: 10 },
      { action: 'Tạo flashcard chủ đề mới trong chat', timeMinutes: 5 },
    ],
    motivationalClosing: '💪 Bạn đang trên đường tiến bộ! Hãy tiếp tục mỗi ngày nhé!',
  };
}

async function generateAnalysis(userId) {
  // Fetch user's flashcard data
  const flashcards = await fetchUserData(userId);

  const userDataSummary = [
    `User ID: ${userId}`,
    `Total flashcards: ${flashcards.length}`,
    `Reviewed: ${flashcards.filter(fc => fc.reviewed_at).length}`,
    `From chat: ${flashcards.filter(fc => fc.source === 'chat-inline').length}`,
    `From AI generate: ${flashcards.filter(fc => fc.source === 'ai').length}`,
    `Recent words: ${flashcards.slice(0, 10).map(fc => fc.word).join(', ')}`,
  ].join('\n');

  try {
    const llmResponse = await callLLM(`Here is the student's learning data:\n\n${userDataSummary}\n\nGenerate a personalized learning analysis in JSON format.`);

    if (llmResponse) {
      // Try to parse JSON from response
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[ANALYSIS] LLM failed, using fallback:', err.message);
  }

  // Fallback: generate analysis without LLM
  return buildFallbackAnalysis(flashcards);
}

module.exports = { generateAnalysis };
