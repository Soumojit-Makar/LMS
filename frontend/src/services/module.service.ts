import api from '../lib/axios';
export const moduleService = {
  create: (d: any) => api.post('/modules', d),
  update: (id: string, d: any) => api.patch(`/modules/${id}`, d),
  delete: (id: string) => api.delete(`/modules/${id}`),
  reorder: (courseId: string, orderedIds: string[]) => api.post('/modules/reorder', { courseId, orderedIds }),
};