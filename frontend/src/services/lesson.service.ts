import api from '../lib/axios';

export const lessonService = {
  create:    (d: any) => api.post('/lessons', d),
  update:    (id: string, d: any) => api.patch(`/lessons/${id}`, d),
  delete:    (id: string) => api.delete(`/lessons/${id}`),
  reorder:   (moduleId: string, orderedIds: string[]) =>
               api.post('/lessons/reorder', { moduleId, orderedIds }),

  /**
   * Returns:
   *  - { type: 'youtube', playbackToken: string }   ← YouTube lesson
   *  - { type: 'video',   url: string, expiresAt }  ← Cloudinary video
   *  - { type: 'pdf',     url: string, filename }   ← Cloudinary PDF
   *  - { type: 'text',    content: string }         ← Text lesson
   */
  getStreamUrl: (id: string) =>
    api.get(`/lessons/${id}/stream-url`).then((r) => r.data.data),

  /**
   * Build the URL for the sandboxed playback iframe.
   * The token is appended as a query param; the actual YouTube URL
   * is resolved ONLY on the server — never exposed in the browser.
   */
  playbackFrameUrl: (lessonId: string, token: string): string => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api';
    return `${base}/lessons/${lessonId}/playback-frame?token=${encodeURIComponent(token)}`;
  },
};