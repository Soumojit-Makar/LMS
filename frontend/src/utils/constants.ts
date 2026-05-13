export const APP_NAME    = import.meta.env.VITE_APP_NAME || 'Digitalindian Skill Academy';
export const API_BASE    = import.meta.env.VITE_API_BASE_URL || '/api';
export const RZP_KEY_ID  = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
export const CDN_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';

export const ROLES = { STUDENT: 'student', TRAINER: 'trainer', ADMIN: 'admin' } as const;

export const COURSE_LEVELS = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' },
] as const;

export const COURSE_STATUSES = [
  { value: 'draft',     label: 'Draft',     color: 'badge-yellow' },
  { value: 'published', label: 'Published', color: 'badge-green' },
  { value: 'archived',  label: 'Archived',  color: 'badge-gray' },
] as const;

export const LESSON_TYPES = [
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'video',   label: 'Uploaded Video' },
  { value: 'pdf',     label: 'PDF Document' },
  { value: 'text',    label: 'Text / Article' },
] as const;
