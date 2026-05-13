import api from '../lib/axios';
export const mediaService = {
  signUpload: (uploadType: string, filename?: string) => api.post('/media/sign-upload', { uploadType, filename }).then((r) => r.data),
  complete: (d: any) => api.post('/media/complete', d),
  delete: (id: string, d: any) => api.delete(`/media/${id}`, { data: d }),
};