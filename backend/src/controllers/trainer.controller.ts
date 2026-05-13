import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { PaymentTransaction } from '../models/PaymentTransaction.model';
import { Review } from '../models/Review.model';
import { ApiError } from '../utils/ApiError';

export const trainerOverview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.id;
    const courses = await Course.find({ trainer: trainerId }).lean();
    const courseIds = courses.map((c) => c._id);

    const [totalEnrollments, totalRevenue, avgRating] = await Promise.all([
      Enrollment.countDocuments({ course: { $in: courseIds } }),
      PaymentTransaction.aggregate([
        { $match: { course: { $in: courseIds }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Review.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.status === 'published').length,
        draftCourses: courses.filter((c) => c.status === 'draft').length,
        totalEnrollments,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageRating: avgRating[0]?.avg ? Math.round(avgRating[0].avg * 10) / 10 : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const trainerCourseAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) throw new ApiError(404, 'Course not found');
    if (course.trainer.toString() !== req.user!.id) throw new ApiError(403, 'Not authorized');

    const [enrollments, revenue, completions, reviews] = await Promise.all([
      Enrollment.countDocuments({ course: course._id }),
      PaymentTransaction.aggregate([
        { $match: { course: course._id, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Enrollment.countDocuments({ course: course._id, progressPercent: 100 }),
      Review.aggregate([
        { $match: { course: course._id } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
      ]),
    ]);

    const ratingDist = [1, 2, 3, 4, 5].reduce((acc, r) => {
      acc[r] = reviews.find((x) => x._id === r)?.count || 0;
      return acc;
    }, {} as Record<number, number>);

    res.json({
      success: true,
      data: {
        enrollments,
        revenue: revenue[0]?.total || 0,
        completions,
        completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
        ratingAverage: course.ratingAverage,
        ratingCount: course.ratingCount,
        ratingDistribution: ratingDist,
      },
    });
  } catch (err) {
    next(err);
  }
};
