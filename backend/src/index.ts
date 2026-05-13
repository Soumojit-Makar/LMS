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

/**
 * Security headers
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

/**
 * Compression
 */
app.use(compression() as any);

/**
 * CORS
 */
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = env.CORS_ORIGIN.split(',').map((s) => s.trim());

      if (!origin || allowed.includes(origin) || allowed.includes('*')) {
        return cb(null, true);
      }

      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

/**
 * Raw body capture for webhooks
 * Must be before express.json()
 */
app.use('/api/webhooks', (req: any, _res, next) => {
  let data = '';

  req.setEncoding('utf8');

  req.on('data', (chunk: string) => {
    data += chunk;
  });

  req.on('end', () => {
    req.rawBody = data;
    next();
  });
});

/**
 * Body parsers
 */
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

/**
 * Rate limiter
 */
app.use('/api', globalRateLimiter);

/**
 * IMPORTANT:
 * Ensure MongoDB is connected before any API route/controller runs.
 */
app.use('/api', async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Routes
 */
app.use('/api', routes);

/**
 * 404 handler
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * Global error handler
 */
app.use(errorHandler);

/**
 * Local development server
 * Vercel will ignore this because it uses exported app.
 */
if (env.NODE_ENV === 'development') {
  const PORT = Number(env.PORT) || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Backend running: http://localhost:${PORT}/api/health`);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });
}

export default app;