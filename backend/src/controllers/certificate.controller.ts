import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { Enrollment } from '../models/Enrollment.model';
import { User } from '../models/User.model';
import { Course } from '../models/Course.model';
import { QuizAttempt } from '../models/QuizAttempt.model';
import { Quiz } from '../models/Quiz.model';
import { ApiError } from '../utils/ApiError';
import { generateCertificate } from '../services/certificate.service';

export const downloadCertificate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({ student: req.user!.id, course: courseId });
    if (!enrollment) throw new ApiError(403, 'Not enrolled in this course');
    if (enrollment.progressPercent < 100) throw new ApiError(400, 'Complete all lessons first');

    const quiz = await Quiz.findOne({ course: courseId, isPublished: true });
    if (quiz) {
      const passed = await QuizAttempt.findOne({ student: req.user!.id, course: courseId, passed: true });
      if (!passed) throw new ApiError(400, 'Pass the course quiz to unlock your certificate');
    }

    const [user, course] = await Promise.all([User.findById(req.user!.id), Course.findById(courseId)]);
    if (!user || !course) throw new ApiError(404, 'Data not found');

    if (!enrollment.certificateIssued) {
      enrollment.certificateIssued = true;
      enrollment.certificateIssuedAt = new Date();
      await enrollment.save();
    }

    const pdfBuffer = await generateCertificate(user as any, course as any);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="certificate-${course.slug}.pdf"`, 'Content-Length': String(pdfBuffer.length) });
    res.send(pdfBuffer);
  } catch (err) { next(err); }
};

export const checkEligibility = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({ student: req.user!.id, course: courseId });
    if (!enrollment) return res.json({ success: true, data: { eligible: false, reason: 'Not enrolled' } });
    if (enrollment.progressPercent < 100) return res.json({ success: true, data: { eligible: false, reason: 'Complete all lessons', progressPercent: enrollment.progressPercent } });
    const quiz = await Quiz.findOne({ course: courseId, isPublished: true });
    if (quiz) {
      const passed = await QuizAttempt.findOne({ student: req.user!.id, course: courseId, passed: true });
      if (!passed) return res.json({ success: true, data: { eligible: false, reason: 'Pass the quiz' } });
    }
    res.json({ success: true, data: { eligible: true, certificateIssued: enrollment.certificateIssued, issuedAt: enrollment.certificateIssuedAt } });
  } catch (err) { next(err); }
};
