import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { globalRateLimiter } from './middlewares/rateLimiter';
import routes from './routes';

const app = express();

// Connect DB (cached for Vercel serverless reuse)
connectDB().catch((err) => console.error('DB connection failed:', err));

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // configured per-route where needed
}));

// Compression
app.use(compression() as any);

// CORS
app.use(cors({
  origin: (origin, cb) => {
    const allowed = env.CORS_ORIGIN.split(',').map((s) => s.trim());
    if (!origin || allowed.includes(origin) || allowed.includes('*')) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Raw body capture for webhooks — MUST come before json()
app.use('/api/webhooks', (req: any, _res, next) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk: string) => { data += chunk; });
  req.on('end', () => { req.rawBody = data; next(); });
});

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Global rate limiter
app.use('/api', globalRateLimiter);

// All routes
app.use('/api', routes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralised error handler
app.use(errorHandler);

// Local dev server (Vercel ignores this)
if (env.NODE_ENV === 'development') {
  const PORT = Number(env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Backend: http://localhost:${PORT}/api/health`);
  });
}

export default app;
