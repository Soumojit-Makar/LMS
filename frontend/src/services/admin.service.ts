import api from '../lib/axios';
export const adminService = {
  overview: () => api.get('/admin/analytics/overview').then((r) => r.data.data),
  users: (p?: any) => api.get('/admin/users', { params: p }).then((r) => r.data.data),
  changeRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleActive: (id: string) => api.patch(`/admin/users/${id}/toggle-active`),
  approveTrainer: (id: string, approved: boolean) => api.patch(`/admin/trainers/${id}/approve`, { approved }),
  courses: (p?: any) => api.get('/admin/courses', { params: p }).then((r) => r.data.data),
  transactions: (p?: any) => api.get('/admin/transactions', { params: p }).then((r) => r.data.data),
};