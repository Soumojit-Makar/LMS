import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['student', 'trainer']),
});

export const courseSchema = z.object({
  title:            z.string().min(5, 'Title must be at least 5 characters'),
  description:      z.string().min(20, 'Description must be at least 20 characters'),
  shortDescription: z.string().max(300).optional(),
  category:         z.string().min(1, 'Select a category'),
  level:            z.enum(['beginner', 'intermediate', 'advanced']),
  language:         z.string().default('English'),
  isFree:           z.boolean().default(false),
  price:            z.number().min(0).optional(),
});

export const reviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string().min(1),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
