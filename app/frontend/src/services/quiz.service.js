import api from './api'

export const quizService = {
  generate: (topic, count = 5) => api.post('/quizzes/generate', { topic, count }),

  getQuiz: (quizId) => api.get(`/quizzes/${quizId}`),

  submitQuiz: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),

  listAttempts: () => api.get('/quizzes/attempts'),
}

export default quizService
