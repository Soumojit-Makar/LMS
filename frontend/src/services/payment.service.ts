import api from '../lib/axios';
export const paymentService = {
  createOrder: (courseId: string) => api.post('/payments/create-order', { courseId }).then((r) => r.data),
  verifyPayment: (d: any) => api.post('/payments/verify', d),
  myTransactions: () => api.get('/payments/my-transactions'),
};