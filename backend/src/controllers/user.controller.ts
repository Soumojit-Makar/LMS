import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { User } from '../models/User.model';
import { ApiError } from '../utils/ApiError';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, bio, avatar } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user!.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};
