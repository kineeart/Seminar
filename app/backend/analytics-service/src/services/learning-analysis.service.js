/**
 * Learning Analysis Service
 * Generates detailed AI-powered learning analysis by calling LLM directly.
 */

function getQuizServiceUrl() {
  return process.env.QUIZ_SERVICE_URL || 'http://localhost:5004';
}

function getFlashcardServiceUrl() {
  return process.env.FLASHCARD_SERVICE_URL || 'http://localhost:3003';
}

async function fetchJson(url, timeoutMs = 8000) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function fetchUserData(userId) {
  const quizUrl = getQuizServiceUrl();
  const flashcardUrl = getFlashcardServiceUrl();

  const [progressData, recommendationData, flashcardData] = await Promise.all([
    fetchJson(`${quizUrl}/progress?userId=${encodeURIComponent(userId)}`),
    fetchJson(`${quizUrl}/progress/recommendations?userId=${encodeURIComponent(userId)}`),
    fetchJson(`${flashcardUrl}/history?userId=${encodeURIComponent(userId)}&limit=100`),
  ]);

  return {
    progress: progressData?.progress || progressData || null,
    recommendations: recommendationData?.recommendations || null,
    flashcards: flashcardData?.flashcards || [],
  };
}

// ─── LLM Call ───────────────────────────────────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `Bạn là chuyên gia phân tích học tập tiếng Anh cho sinh viên Việt Nam (TOEIC/IELTS/VSTEP).

Phân tích dữ liệu học tập và trả về JSON với cấu trúc CHÍNH XÁC sau:

{
  "greeting": "Lời chào cá nhân hóa với emoji",
  "overallSummary": "Tóm tắt tổng quan 3-4 câu về hành trình học",
  "accuracyAnalysis": {
    "level": "beginner|intermediate|advanced|excellent",
    "score": <số % chính xác>,
    "feedback": "Phân tích chi tiết 5-7 câu về độ chính xác, so sánh với mức trung bình, chỉ ra pattern lỗi",
    "tips": ["mẹo cụ thể 1", "mẹo cụ thể 2", "mẹo cụ thể 3", "mẹo cụ thể 4"]
  },
  "streakAnalysis": {
    "status": "building|consistent|dedicated|legendary",
    "currentStreak": <số ngày>,
    "feedback": "Phân tích thói quen học 4-5 câu, so sánh với mục tiêu lý tưởng",
    "motivation": "Câu động viên mạnh mẽ, cụ thể"
  },
  "vocabularyInsights": {
    "level": "developing|growing|solid|impressive",
    "totalWords": <số từ>,
    "reviewedWords": <số từ đã ôn>,
    "chatWords": <số từ từ chat>,
    "feedback": "Phân tích chi tiết 5-6 câu về tiến độ từ vựng, tốc độ học, retention rate",
    "recommendation": "Lời khuyên cụ thể về cách mở rộng vốn từ",
    "topWords": ["từ 1", "từ 2", "từ 3"]
  },
  "topicAnalysis": {
    "strongTopics": ["topic mạnh 1", "topic mạnh 2"],
    "weakTopics": ["topic yếu 1", "topic yếu 2"],
    "feedback": "Phân tích chi tiết về phân bố topic, đề xuất topic nên học tiếp",
    "suggestedNextTopics": ["topic gợi ý 1", "topic gợi ý 2"]
  },
  "studyHabits": {
    "pattern": "Mô tả pattern học tập (ví dụ: học buổi tối, học ngắn nhưng đều)",
    "averageSessionMinutes": <số phút trung bình>,
    "feedback": "Đánh giá thói quen và gợi ý cải thiện",
    "idealSchedule": "Lịch học lý tưởng gợi ý"
  },
  "personalInsights": {
    "learningStyle": "Phong cách học được nhận diện",
    "strengths": ["điểm mạnh 1", "điểm mạnh 2", "điểm mạnh 3"],
    "growthAreas": ["cần cải thiện 1", "cần cải thiện 2"],
    "personalityNote": "Nhận xét về tính cách học tập"
  },
  "priorityActions": [
    {"priority": 1, "action": "Hành động cụ thể nhất", "reason": "Lý do", "words": ["từ 1", "từ 2"], "timeMinutes": 15},
    {"priority": 2, "action": "Hành động tiếp theo", "reason": "Lý do", "words": [], "timeMinutes": 10},
    {"priority": 3, "action": "Hành động bổ sung", "reason": "Lý do", "words": [], "timeMinutes": 10}
  ],
  "weeklyGoal": {
    "description": "Mục tiêu tuần này",
    "targetWords": <số từ mục tiêu>,
    "targetQuizzes": <số quiz mục tiêu>,
    "targetMinutes": <số phút mục tiêu>
  },
  "motivationalClosing": "Lời kết động viên mạnh mẽ, cá nhân hóa với emoji"
}

QUY TẮC:
- Trả về CHỈ JSON hợp lệ, không markdown, không text thừa.
- Tất cả nội dung bằng tiếng Việt.
- Phân tích PHẢI cụ thể, dựa trên số liệu thực.
- Đưa ra lời khuyên HÀNH ĐỘNG ĐƯỢC, không chung chung.
- Tone: ấm áp, chuyên nghiệp, khích lệ nhưng thực tế.`;

async function callLLM(userPrompt) {
  const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://llm.chiasegpu.vn/v1';
  const LLM_API_KEY = process.env.LLM_API_KEY;
  const LLM_MODEL = process.env.LLM_MODEL || 'gpt-5.5';

  if (!LLM_API_KEY) return null;

  const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LLM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    throw new Error(`LLM error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';
  // Strip think tags
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

// ─── Fallback Analysis (no LLM needed) ─────────────────────────────────────────

function buildFallbackAnalysis(progress, recommendations, flashcards) {
  const accuracy = progress?.quiz_accuracy || 0;
  const streak = progress?.streak_days || 0;
  const words = progress?.learned_words_count || flashcards.length || 0;
  const weakTopics = progress?.weak_topics || [];
  const reviewWords = recommendations?.review_words || [];
  const chatCards = flashcards.filter(fc => fc.source === 'chat-inline');
  const reviewedCards = flashcards.filter(fc => fc.reviewed_at);
  const recentWords = flashcards.slice(0, 5).map(fc => fc.word);

  return {
    greeting: '👋 Xin chào! Đây là phân tích học tập chi tiết của bạn.',
    overallSummary: `Bạn đã học ${words} từ vựng, duy trì streak ${streak} ngày và đạt độ chính xác ${accuracy}% trong các bài quiz. ${chatCards.length > 0 ? `Trong đó ${chatCards.length} từ được tạo từ chat AI.` : ''}`,
    accuracyAnalysis: {
      level: accuracy >= 85 ? 'excellent' : accuracy >= 70 ? 'advanced' : accuracy >= 55 ? 'intermediate' : 'beginner',
      score: accuracy,
      feedback: accuracy >= 85
        ? `Xuất sắc! Độ chính xác ${accuracy}% cho thấy bạn nắm vững kiến thức. Bạn đang ở mức cao hơn trung bình. Hãy thử tăng độ khó quiz để thách thức bản thân.`
        : accuracy >= 70
          ? `Tốt! ${accuracy}% là mức khá. Bạn hiểu phần lớn nội dung nhưng vẫn còn chỗ cải thiện. Tập trung vào các từ hay sai sẽ giúp bạn vượt 85%.`
          : `Đang tiến bộ! ${accuracy}% cho thấy bạn đang xây dựng nền tảng. Ôn lại từ sai và làm quiz theo topic sẽ giúp tăng nhanh.`,
      tips: [
        'Ôn lại từ sai ngay sau khi làm quiz (spaced repetition)',
        'Làm quiz ngắn 10 câu mỗi ngày thay vì 1 lần dài',
        'Đọc ví dụ câu của từ vựng để hiểu ngữ cảnh',
        'Ghi chú từ hay nhầm vào sổ riêng',
      ],
    },
    streakAnalysis: {
      status: streak >= 14 ? 'legendary' : streak >= 7 ? 'dedicated' : streak >= 3 ? 'consistent' : 'building',
      currentStreak: streak,
      feedback: streak >= 7
        ? `Tuyệt vời! ${streak} ngày liên tục cho thấy thói quen học rất vững. Nghiên cứu cho thấy sau 21 ngày, thói quen sẽ trở thành tự động.`
        : streak >= 3
          ? `Khởi đầu tốt! ${streak} ngày liên tục. Hãy cố gắng duy trì ít nhất 7 ngày để tạo momentum.`
          : `Hãy bắt đầu streak! Chỉ cần 10 phút mỗi ngày. Đặt nhắc nhở cố định sẽ giúp bạn duy trì.`,
      motivation: '🔥 Mỗi ngày bạn học là một bước tiến. Compound effect sẽ tạo ra kết quả đáng kinh ngạc!',
    },
    vocabularyInsights: {
      level: words >= 100 ? 'impressive' : words >= 50 ? 'solid' : words >= 20 ? 'growing' : 'developing',
      totalWords: words,
      reviewedWords: reviewedCards.length,
      chatWords: chatCards.length,
      feedback: `Bạn có ${words} từ trong thư viện, ${reviewedCards.length} từ đã ôn tập, ${chatCards.length} từ tạo từ chat AI. ${reviewedCards.length < words / 2 ? 'Nên ôn tập nhiều hơn để tăng retention.' : 'Tỷ lệ ôn tập tốt!'}`,
      recommendation: reviewWords.length > 0
        ? `Ưu tiên ôn: ${reviewWords.slice(0, 5).join(', ')}. Sau đó tạo thêm flashcard chủ đề mới.`
        : 'Tạo thêm flashcard qua chat AI về các chủ đề TOEIC phổ biến.',
      topWords: recentWords,
    },
    topicAnalysis: {
      strongTopics: [],
      weakTopics,
      feedback: weakTopics.length > 0
        ? `Cần tập trung: ${weakTopics.join(', ')}. Làm 2-3 quiz mỗi topic yếu sẽ cải thiện nhanh.`
        : 'Chưa có đủ dữ liệu topic. Hãy làm thêm quiz để hệ thống phân tích chính xác hơn.',
      suggestedNextTopics: ['Business', 'Travel', 'Technology', 'Health'],
    },
    studyHabits: {
      pattern: streak >= 3 ? 'Học đều đặn' : 'Chưa đều',
      averageSessionMinutes: 15,
      feedback: 'Duy trì 15-20 phút mỗi ngày là lý tưởng cho việc ghi nhớ dài hạn.',
      idealSchedule: 'Sáng: 5 phút ôn từ cũ → Tối: 10 phút học từ mới + 1 quiz ngắn',
    },
    personalInsights: {
      learningStyle: chatCards.length > 5 ? 'Học qua tương tác AI' : 'Học truyền thống',
      strengths: ['Chủ động tạo flashcard', 'Sử dụng AI hỗ trợ', 'Kiên trì học tập'],
      growthAreas: weakTopics.length > 0 ? weakTopics.slice(0, 2) : ['Mở rộng chủ đề', 'Tăng tần suất ôn tập'],
      personalityNote: 'Bạn là người học có mục tiêu rõ ràng và biết tận dụng công nghệ.',
    },
    priorityActions: [
      { priority: 1, action: 'Ôn tập flashcard chưa review', reason: 'Tăng retention rate', words: recentWords.slice(0, 3), timeMinutes: 10 },
      { priority: 2, action: weakTopics[0] ? `Quiz topic: ${weakTopics[0]}` : 'Làm 1 quiz tổng hợp', reason: 'Củng cố kiến thức', words: [], timeMinutes: 15 },
      { priority: 3, action: 'Tạo flashcard chủ đề mới qua chat', reason: 'Mở rộng vốn từ', words: [], timeMinutes: 10 },
    ],
    weeklyGoal: {
      description: 'Mục tiêu tuần này',
      targetWords: Math.max(20, words + 15),
      targetQuizzes: 5,
      targetMinutes: 100,
    },
    motivationalClosing: '💪 Bạn đang trên đường đúng! Mỗi từ mới là một cánh cửa mở ra. Tiếp tục mỗi ngày, kết quả sẽ đến sớm hơn bạn nghĩ! 🌟',
  };
}

// ─── Main Function ──────────────────────────────────────────────────────────────

async function generateLearningAnalysis({ userId, useAI = true }) {
  const { progress, recommendations, flashcards } = await fetchUserData(userId);

  if (useAI) {
    try {
      const userPrompt = `Dữ liệu học tập của sinh viên:

📊 TIẾN ĐỘ QUIZ:
- Độ chính xác: ${progress?.quiz_accuracy || 0}%
- Streak: ${progress?.streak_days || 0} ngày
- Số từ đã học: ${progress?.learned_words_count || flashcards.length}
- Số quiz hoàn thành: ${progress?.quizzes_completed || 0}
- Topic yếu: ${(progress?.weak_topics || []).join(', ') || 'Chưa xác định'}

📖 FLASHCARD:
- Tổng flashcard: ${flashcards.length}
- Từ chat AI: ${flashcards.filter(fc => fc.source === 'chat-inline').length}
- Đã ôn tập: ${flashcards.filter(fc => fc.reviewed_at).length}
- Từ gần đây: ${flashcards.slice(0, 10).map(fc => fc.word).join(', ')}

💡 GỢI Ý HỆ THỐNG:
- Từ cần ôn: ${(recommendations?.review_words || []).slice(0, 8).join(', ') || 'Không có'}
- Quiz tiếp theo: ${recommendations?.next_quiz?.topic || 'general'}

Hãy phân tích CHI TIẾT và trả về JSON theo đúng schema.`;

      const llmResponse = await callLLM(userPrompt);
      if (llmResponse) {
        const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { ...parsed, generatedAt: new Date().toISOString(), source: 'ai' };
        }
      }
    } catch (err) {
      console.warn('[ANALYSIS] LLM failed, using fallback:', err.message);
    }
  }

  return { ...buildFallbackAnalysis(progress, recommendations, flashcards), generatedAt: new Date().toISOString(), source: 'fallback' };
}

module.exports = { generateLearningAnalysis };
