import api from './api'

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),

  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (data) => api.patch('/auth/profile', data),
}

export default authService
