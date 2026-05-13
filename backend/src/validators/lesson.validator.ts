import { z } from 'zod';

export const createLessonSchema = z.object({
  course:        z.string().min(1, 'course is required'),
  module:        z.string().min(1, 'module is required'),
  title:         z.string().min(1).max(300),
  type:          z.enum(['video', 'youtube', 'pdf', 'text']).optional(),
  order:         z.number().int().min(0).optional(),
  isFreePreview: z.boolean().optional(),
  duration:      z.number().min(0).optional(),
  // YouTube path — trainer pastes a YouTube URL
  youtubeUrl:    z.string().url().optional(),
  // Cloudinary / text content path
  content:       z.any().optional(),
}).refine(
  (d) => d.youtubeUrl || d.type,
  { message: 'Either youtubeUrl or type must be provided' }
);

export const updateLessonSchema = z.object({
  title:         z.string().min(1).max(300).optional(),
  order:         z.number().int().min(0).optional(),
  isFreePreview: z.boolean().optional(),
  isPublished:   z.boolean().optional(),
  duration:      z.number().min(0).optional(),
  youtubeUrl:    z.string().optional(),
  content:       z.any().optional(),
});