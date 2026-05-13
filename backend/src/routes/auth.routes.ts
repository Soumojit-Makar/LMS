import { Router } from 'express';
import { register, login, refresh, logout, getMe, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { z } from 'zod';

const router = Router();
const registerSchema = z.object({ name: z.string().min(2).max(100), email: z.string().email(), password: z.string().min(8).max(100), role: z.enum(['student', 'trainer']).optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const changePassSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(100) });

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.patch('/change-password', authenticate, validate(changePassSchema), changePassword);

export default router;
