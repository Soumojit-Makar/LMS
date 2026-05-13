import api from '../lib/axios';
export const categoryService = {
  list: () => api.get('/categories').then((r) => r.data.data),
  create: (d: any) => api.post('/categories', d),
  update: (id: string, d: any) => api.patch(`/categories/${id}`, d),
  delete: (id: string) => api.delete(`/categories/${id}`),
};