import api from './api'

export const quizService = {
  async generate(payload) {
    const finalPayload = {
      topic: payload.topic || 'mixed',
      count: payload.count || 10,
      difficulty: payload.difficulty || 'easy',
      userId: payload.userId,
      useAi: true,
      source: 'ai',
    };
    console.log('[quizService] generating quiz', finalPayload);
    const response = await api.post('/quizzes/generate', finalPayload);
    console.log('[quizService] generate response', response);
    return response.quiz;
  },

  async getQuiz(quizId) {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.quiz;
  },

  async submitQuiz(quizId, answers, userId) {
    const formattedAnswers = (answers || []).map((answer) => ({
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
    }));
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers: formattedAnswers, userId });
    return response.result;
  },

  async listAttempts(userId, limit = 10) {
    const response = await api.get(`/attempts?userId=${encodeURIComponent(userId)}&limit=${limit}`);
    return response.attempts || [];
  },
}

export default quizService
