import api from './api'

export const contentService = {
  listLessons: () => api.get('/content'),

  getLesson: (lessonId) => api.get(`/content/${lessonId}`),

  createLesson: (data) => api.post('/content', data),

  updateLesson: (lessonId, data) => api.patch(`/content/${lessonId}`, data),

  deleteLesson: (lessonId) => api.delete(`/content/${lessonId}`),
}

export default contentService
