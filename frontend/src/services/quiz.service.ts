import api from '../lib/axios';
export const quizService = {
  create: (d: any) => api.post('/quizzes', d),
  update: (id: string, d: any) => api.patch(`/quizzes/${id}`, d),
  get: (id: string) => api.get(`/quizzes/${id}`).then((r) => r.data.data),
  submit: (id: string, answers: number[]) => api.post(`/quizzes/${id}/submit`, { answers }).then((r) => r.data.data),
  myAttempts: (id: string) => api.get(`/quizzes/${id}/attempts/me`).then((r) => r.data.data),
};