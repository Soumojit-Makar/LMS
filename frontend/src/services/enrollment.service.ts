import api from '../lib/axios';
export const enrollmentService = {
  enroll: (courseId: string) => api.post('/enrollments', { courseId }),
  myEnrollments: () => api.get('/enrollments/me'),
  courseEnrollments: (courseId: string, params?: any) => api.get(`/enrollments/${courseId}`, { params }),
};