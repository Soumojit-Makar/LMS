import { z } from 'zod';

export const questionSchema = z.object({
  text:         z.string().min(1, 'Question text required'),
  options:      z.array(z.string().min(1)).min(2, 'At least 2 options required').max(6),
  correctIndex: z.number().int().min(0),
  explanation:  z.string().optional(),
});

export const createQuizSchema = z.object({
  course:       z.string().min(1, 'Course ID required'),
  title:        z.string().min(1).max(200),
  passingScore: z.number().int().min(0).max(100).default(70),
  timeLimit:    z.number().int().min(1).optional(),
  maxAttempts:  z.number().int().min(1).max(10).default(3),
  questions:    z.array(questionSchema).min(1, 'At least one question required'),
});

export const updateQuizSchema = createQuizSchema.partial();

export const submitQuizSchema = z.object({
  answers: z.array(z.number().int().min(0)).min(1),
});
