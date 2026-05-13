import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { PaymentTransaction } from '../models/PaymentTransaction.model';
import { ApiError } from '../utils/ApiError';
import { paginate, paginatedResponse } from '../utils/pagination';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query as any;
    const { skip, limit: lim, page: pg } = paginate(page, limit);
    const filter: any = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) filter.role = role;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: paginatedResponse(users, total, pg, lim) });
  } catch (err) { next(err); }
};

export const changeUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!['student', 'trainer', 'admin'].includes(role)) throw new ApiError(400, 'Invalid role');
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const toggleUserActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const approveTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { approved } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role !== 'trainer') throw new ApiError(400, 'User is not a trainer');
    user.trainerApproved = Boolean(approved);
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const adminListCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query as any;
    const { skip, limit: lim, page: pg } = paginate(page, limit);
    const filter: any = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    const [courses, total] = await Promise.all([
      Course.find(filter).populate('trainer', 'name email').populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      Course.countDocuments(filter),
    ]);
    res.json({ success: true, data: paginatedResponse(courses, total, pg, lim) });
  } catch (err) { next(err); }
};

export const adminOverview = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalStudents, totalTrainers, totalCourses, totalEnrollments, revenueAgg] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'trainer' }),
      Course.countDocuments({ status: 'published' }),
      Enrollment.countDocuments(),
      PaymentTransaction.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    res.json({
      success: true,
      data: { totalStudents, totalTrainers, totalPublishedCourses: totalCourses, totalEnrollments, totalRevenue: revenueAgg[0]?.total || 0 },
    });
  } catch (err) { next(err); }
};

export const adminTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status } = req.query as any;
    const { skip, limit: lim, page: pg } = paginate(page, limit);
    const filter: any = {};
    if (status) filter.status = status;
    const [txns, total] = await Promise.all([
      PaymentTransaction.find(filter).populate('student', 'name email').populate('course', 'title').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      PaymentTransaction.countDocuments(filter),
    ]);
    res.json({ success: true, data: paginatedResponse(txns, total, pg, lim) });
  } catch (err) { next(err); }
};
