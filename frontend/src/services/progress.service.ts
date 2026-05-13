import api from '../lib/axios';
export const progressService = {
  complete: (lessonId: string, watchedSeconds?: number) => api.post(`/progress/lessons/${lessonId}/complete`, { watchedSeconds }),
  getCourseProgress: (courseId: string) => api.get(`/progress/courses/${courseId}`),
};