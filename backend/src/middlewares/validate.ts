import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const msg = result.error.errors
        .map((e) => `${e.path.join('.') || 'field'}: ${e.message}`)
        .join('; ');
      next(new ApiError(400, msg));
      return;
    }
    (req as any)[source] = result.data;
    next();
  };
