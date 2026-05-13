import { Enrollment } from '../models/Enrollment.model';
import { PaymentTransaction } from '../models/PaymentTransaction.model';
import { Course } from '../models/Course.model';
import { User } from '../models/User.model';
import mongoose from 'mongoose';

export async function platformOverview() {
  const [
    totalStudents,
    totalTrainers,
    totalCourses,
    totalEnrollments,
    revenueAgg,
    recentEnrollments,
  ] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'trainer', trainerApproved: true }),
    Course.countDocuments({ status: 'published' }),
    Enrollment.countDocuments(),
    PaymentTransaction.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Enrollment.find()
      .sort({ enrolledAt: -1 })
      .limit(10)
      .populate('student', 'name email')
      .populate('course', 'title slug')
      .lean(),
  ]);

  return {
    totalStudents,
    totalTrainers,
    totalPublishedCourses: totalCourses,
    totalEnrollments,
    totalRevenue: revenueAgg[0]?.total || 0,
    totalTransactions: revenueAgg[0]?.count || 0,
    recentEnrollments,
  };
}

export async function trainerCourseStats(trainerId: string) {
  const courses = await Course.find({ trainer: trainerId }).lean();
  const ids = courses.map((c) => c._id);

  const [enrollments, revenue, completions] = await Promise.all([
    Enrollment.countDocuments({ course: { $in: ids } }),
    PaymentTransaction.aggregate([
      { $match: { course: { $in: ids }, status: 'paid' } },
      { $group: { _id: '$course', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Enrollment.countDocuments({ course: { $in: ids }, progressPercent: 100 }),
  ]);

  const revenueMap: Record<string, number> = {};
  revenue.forEach((r: any) => { revenueMap[r._id.toString()] = r.total; });

  return courses.map((c) => ({
    _id: c._id,
    title: c.title,
    slug: c.slug,
    status: c.status,
    enrollmentCount: c.enrollmentCount,
    ratingAverage: c.ratingAverage,
    revenue: revenueMap[c._id.toString()] || 0,
  }));
}
