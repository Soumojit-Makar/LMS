import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { LessonProgress } from '../models/LessonProgress.model';
import { Enrollment } from '../models/Enrollment.model';
import { Lesson } from '../models/Lesson.model';
import { ApiError } from '../utils/ApiError';

export const completeLesson = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) throw new ApiError(404, 'Lesson not found');

    const enrollment = await Enrollment.findOne({
      student: req.user!.id,
      course: lesson.course,
    });
    if (!enrollment) throw new ApiError(403, 'Not enrolled in this course');

    await LessonProgress.findOneAndUpdate(
      { student: req.user!.id, lesson: lessonId },
      {
        student: req.user!.id,
        lesson: lessonId,
        course: lesson.course,
        completed: true,
        completedAt: new Date(),
        watchedSeconds: req.body.watchedSeconds,
      },
      { upsert: true, new: true }
    );

    // Recalculate progress
    const [completedCount, totalCount] = await Promise.all([
      LessonProgress.countDocuments({ student: req.user!.id, course: lesson.course, completed: true }),
      Lesson.countDocuments({ course: lesson.course, isPublished: true }),
    ]);

    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const isCompleted = progressPercent === 100;

    await Enrollment.findByIdAndUpdate(enrollment._id, {
      progressPercent,
      completedAt: isCompleted && !enrollment.completedAt ? new Date() : enrollment.completedAt,
    });

    res.json({ success: true, data: { progressPercent, completed: isCompleted, completedLessons: completedCount, totalLessons: totalCount } });
  } catch (err) {
    next(err);
  }
};

export const getCourseProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user!.id,
      course: courseId,
    });
    if (!enrollment) throw new ApiError(403, 'Not enrolled in this course');

    const completedLessons = await LessonProgress.find({
      student: req.user!.id,
      course: courseId,
      completed: true,
    }).select('lesson').lean();

    res.json({
      success: true,
      data: {
        progressPercent: enrollment.progressPercent,
        completedAt: enrollment.completedAt,
        completedLessons: completedLessons.map((p) => p.lesson.toString()),
        certificateIssued: enrollment.certificateIssued,
      },
    });
  } catch (err) {
    next(err);
  }
};
