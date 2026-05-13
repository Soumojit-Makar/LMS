import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === 'admin') throw new ApiError(403, 'Cannot self-register as admin');

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, 'Email already registered');

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      trainerAppliedAt: role === 'trainer' ? new Date() : undefined,
    });

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    const hashed = hashToken(refreshToken);

    await User.findByIdAndUpdate(user.id, { $push: { refreshTokens: hashed } });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      data: { user },
      tokens: { accessToken, expiresIn: 900 },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) throw new ApiError(401, 'Invalid credentials');
    if (!user.isActive) throw new ApiError(403, 'Account has been disabled');
    if (user.role === 'trainer' && !user.trainerApproved) {
      throw new ApiError(403, 'Your trainer account is pending admin approval');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    const hashed = hashToken(refreshToken);

    // Keep last 5 refresh tokens
    const tokens = [...(user.refreshTokens || []).slice(-4), hashed];
    await User.findByIdAndUpdate(user.id, { refreshTokens: tokens });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // Strip sensitive fields
    const userObj = user.toJSON();

    res.json({
      success: true,
      data: { user: userObj },
      tokens: { accessToken, expiresIn: 900 },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new ApiError(401, 'No refresh token');

    const payload = verifyRefreshToken(token);
    const hashed = hashToken(token);

    const user = await User.findById(payload.sub).select('+refreshTokens');
    if (!user) throw new ApiError(401, 'User not found');
    if (!user.refreshTokens.includes(hashed)) throw new ApiError(401, 'Refresh token revoked');

    const newRefreshToken = signRefreshToken({ sub: user.id });
    const newHashed = hashToken(newRefreshToken);

    const tokens = user.refreshTokens.filter((t) => t !== hashed);
    tokens.push(newHashed);
    await User.findByIdAndUpdate(user.id, { refreshTokens: tokens.slice(-5) });

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    res.json({ success: true, accessToken, expiresIn: 900 });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const hashed = hashToken(token);
      const payload = verifyRefreshToken(token).sub;
      await User.findByIdAndUpdate(payload, { $pull: { refreshTokens: hashed } });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch {
    res.clearCookie('refreshToken');
    res.json({ success: true });
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) throw new ApiError(404, 'User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

    user.password = newPassword;
    // Invalidate all refresh tokens on password change
    user.refreshTokens = [];
    await user.save();

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
};
