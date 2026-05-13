import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { ApiError } from '../utils/ApiError';

export const authorize = (...roles: string[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Not authenticated'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, `Role '${req.user.role}' is not allowed. Required: ${roles.join(', ')}`));
      return;
    }
    next();
  };
