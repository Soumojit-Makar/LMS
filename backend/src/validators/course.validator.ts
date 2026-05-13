import { z } from 'zod';

export const createCourseSchema = z.object({
  title:            z.string().min(5, 'Title must be at least 5 characters').max(200),
  description:      z.string().min(20, 'Description must be at least 20 characters'),
  shortDescription: z.string().max(300).optional(),
  category:         z.string().min(1, 'Category is required'),
  level:            z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  language:         z.string().default('English'),
  thumbnail: z.object({
    publicId: z.string().min(1),
    url:      z.string().url(),
  }).optional(),
  pricing: z.object({
    isFree:        z.boolean().default(false),
    price:         z.number().min(0).default(0),
    discountPrice: z.number().min(0).optional(),
    currency:      z.string().default('INR'),
  }).optional(),
  tags:         z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  outcomes:     z.array(z.string()).optional(),
  certificateEnabled: z.boolean().optional(),
  passingScore:       z.number().min(0).max(100).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const courseStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
});
