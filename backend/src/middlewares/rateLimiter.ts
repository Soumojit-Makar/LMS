import rateLimit from 'express-rate-limit';

export const rateLimiter = (windowMinutes: number, maxRequests: number) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });

export const authRateLimiter = rateLimiter(15, 20);
export const globalRateLimiter = rateLimiter(1, 100);
