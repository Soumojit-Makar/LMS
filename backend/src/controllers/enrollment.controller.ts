import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { Enrollment } from '../models/Enrollment.model';
import { Course } from '../models/Course.model';
import { User } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { paginate, paginatedResponse } from '../utils/pagination';

export const enroll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found');
    if (course.status !== 'published') throw new ApiError(400, 'Course is not available');
    if (!course.pricing.isFree) {
      throw new ApiError(402, 'This is a paid course. Please complete payment first.');
    }

    const existing = await Enrollment.findOne({ student: req.user!.id, course: courseId });
    if (existing) throw new ApiError(409, 'Already enrolled in this course');

    const enrollment = await Enrollment.create({
      student: req.user!.id,
      course: courseId,
    });

    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};

export const myEnrollments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user!.id })
      .populate({ path: 'course', populate: [{ path: 'category', select: 'name' }, { path: 'trainer', select: 'name avatar' }] })
      .sort({ enrolledAt: -1 })
      .lean();

    res.json({ success: true, data: enrollments });
  } catch (err) {
    next(err);
  }
};

export const courseEnrollments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20, search } = req.query as any;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    // Trainers can only see their own course enrollments
    if (req.user!.role === 'trainer') {
      const course = await Course.findById(courseId);
      if (!course || course.trainer.toString() !== req.user!.id) {
        throw new ApiError(403, 'Not authorized');
      }
    }

    let studentIds: string[] | undefined;
    if (search) {
      const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id').lean();
      studentIds = users.map((u) => u._id.toString());
    }

    const filter: any = { course: courseId };
    if (studentIds) filter.student = { $in: studentIds };

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .populate('student', 'name email avatar')
        .sort({ enrolledAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Enrollment.countDocuments(filter),
    ]);

    res.json({ success: true, data: paginatedResponse(enrollments, total, pg, lim) });
  } catch (err) {
    next(err);
  }
};
