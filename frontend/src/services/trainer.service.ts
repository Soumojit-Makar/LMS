import api from '../lib/axios';
export const trainerService = {
  overview: () => api.get('/trainer/analytics/overview').then((r) => r.data.data),
  courseAnalytics: (courseId: string) => api.get(`/trainer/analytics/courses/${courseId}`).then((r) => r.data.data),
};