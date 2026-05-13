import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { Review } from '../models/Review.model';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { ApiError } from '../utils/ApiError';
import { paginate, paginatedResponse } from '../utils/pagination';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId, rating, comment } = req.body;

    const enrollment = await Enrollment.findOne({ student: req.user!.id, course: courseId });
    if (!enrollment) throw new ApiError(403, 'You must be enrolled to leave a review');

    const existing = await Review.findOne({ course: courseId, student: req.user!.id });
    if (existing) throw new ApiError(409, 'You have already reviewed this course');

    const review = await Review.create({ course: courseId, student: req.user!.id, rating, comment });

    // Recalculate rating average
    const stats = await Review.aggregate([
      { $match: { course: review.course } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Course.findByIdAndUpdate(courseId, {
        ratingAverage: Math.round(stats[0].avg * 10) / 10,
        ratingCount: stats[0].count,
      });
    }

    await review.populate('student', 'name avatar');
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const getCourseReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query as any;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const [reviews, total] = await Promise.all([
      Review.find({ course: courseId })
        .populate('student', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Review.countDocuments({ course: courseId }),
    ]);

    res.json({ success: true, data: paginatedResponse(reviews, total, pg, lim) });
  } catch (err) {
    next(err);
  }
};

export const replyToReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findById(req.params.id).populate<{ course: any }>('course', 'trainer');
    if (!review) throw new ApiError(404, 'Review not found');
    if (review.course.trainer.toString() !== req.user!.id) throw new ApiError(403, 'Not authorized');

    review.trainerReply = req.body.reply;
    review.repliedAt = new Date();
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};
