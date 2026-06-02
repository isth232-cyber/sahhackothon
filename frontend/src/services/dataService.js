import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post(`/auth/forgot-password?email=${email}`),
  resetPassword: (token, newPassword) => api.post(`/auth/reset-password?token=${token}&newPassword=${newPassword}`),
};

export const classroomService = {
  create: (data) => api.post('/classrooms', data),
  getById: (id) => api.get(`/classrooms/${id}`),
  getMyClassrooms: () => api.get('/classrooms/my-classrooms'),
  update: (id, data) => api.put(`/classrooms/${id}`, data),
  delete: (id) => api.delete(`/classrooms/${id}`),
  join: (inviteCode) => api.post(`/classrooms/join?inviteCode=${inviteCode}`),
  getStudents: (id) => api.get(`/classrooms/${id}/students`),
};

export const lessonService = {
  create: (data) => api.post('/lessons', data),
  getById: (id) => api.get(`/lessons/${id}`),
  getByClassroom: (classroomId, publishedOnly = false) =>
    api.get(`/lessons/classroom/${classroomId}?publishedOnly=${publishedOnly}`),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
};

export const quizService = {
  create: (data) => api.post('/quizzes', data),
  getById: (id) => api.get(`/quizzes/${id}`),
  getByClassroom: (classroomId, publishedOnly = false) =>
    api.get(`/quizzes/classroom/${classroomId}?publishedOnly=${publishedOnly}`),
  publish: (id) => api.put(`/quizzes/${id}/publish`),
  submitAttempt: (data) => api.post('/quizzes/attempt', data),
  getAttempts: (quizId) => api.get(`/quizzes/${quizId}/attempts`),
  getMyAttempts: () => api.get('/quizzes/my-attempts'),
  delete: (id) => api.delete(`/quizzes/${id}`),
};

export const aiService = {
  translate: (text, language) => api.post('/ai/translate', { text, language }),
  simplify: (text, language) => api.post('/ai/simplify', { text, language }),
  getRecommendations: (classroomId) => api.get(`/ai/recommendations/${classroomId}`),
  generateRecommendations: (classroomId) => api.post(`/ai/recommendations/generate/${classroomId}`),
  resolveRecommendation: (id) => api.put(`/ai/recommendations/${id}/resolve`),
  generateNumeracyStory: (ageGroup, topic, language) =>
    api.get(`/ai/numeracy-story?ageGroup=${ageGroup}&topic=${topic}&language=${language}`),
  assessReadingLevel: (text) => api.post('/ai/reading-level', { text }),
  generatePhonics: (letter, language) =>
    api.get(`/ai/phonics?letter=${encodeURIComponent(letter)}&language=${language}`),
};

export const attendanceService = {
  mark: (data) => api.post('/attendance/mark', data),
  getByDate: (classroomId, date) => api.get(`/attendance/classroom/${classroomId}?date=${date}`),
  getStats: (studentId, classroomId) => api.get(`/attendance/stats/${studentId}/${classroomId}`),
  getReport: (classroomId, year, month) =>
    api.get(`/attendance/report/${classroomId}?year=${year}&month=${month}`),
};

export const participationService = {
  track: (studentId, classroomId, eventType, description) =>
    api.post(`/participation/track?studentId=${studentId}&classroomId=${classroomId}&eventType=${eventType}&description=${description || ''}`),
  getStats: (studentId, classroomId) => api.get(`/participation/stats/${studentId}/${classroomId}`),
  getHeatmap: (classroomId) => api.get(`/participation/heatmap/${classroomId}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const adminService = {
  getAnalytics: () => api.get('/admin/analytics'),
  getTeachers: () => api.get('/admin/teachers'),
  getStudents: () => api.get('/admin/students'),
  getClassrooms: () => api.get('/admin/classrooms'),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
};
