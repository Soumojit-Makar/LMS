import api from '../lib/axios';
export const courseService = {
  list: (params?: Record<string,any>) => api.get('/courses', { params }),
  get: (slug: string) => api.get(`/courses/${slug}`),
  create: (d: any) => api.post('/courses', d),
  update: (id: string, d: any) => api.patch(`/courses/${id}`, d),
  updateStatus: (id: string, status: string) => api.patch(`/courses/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/courses/${id}`),
  getByTrainer: (trainerId: string, params?: Record<string,any>) => api.get(`/courses/trainer/${trainerId}`, { params }),
};