import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { Quiz } from '../models/Quiz.model';
import { QuizAttempt } from '../models/QuizAttempt.model';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { ApiError } from '../utils/ApiError';

export const createQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { course, title, passingScore, timeLimit, questions, maxAttempts } = req.body;
    const courseDoc = await Course.findById(course);
    if (!courseDoc) throw new ApiError(404, 'Course not found');
    if (courseDoc.trainer.toString() !== req.user!.id) throw new ApiError(403, 'Not authorized');

    const quiz = await Quiz.create({ course, title, passingScore, timeLimit, questions, maxAttempts });
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

export const updateQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate<{ course: any }>('course', 'trainer');
    if (!quiz) throw new ApiError(404, 'Quiz not found');
    if (quiz.course.trainer.toString() !== req.user!.id) throw new ApiError(403, 'Not authorized');

    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const getQuizForStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz || !quiz.isPublished) throw new ApiError(404, 'Quiz not found');

    const enrollment = await Enrollment.findOne({ student: req.user!.id, course: quiz.course });
    if (!enrollment) throw new ApiError(403, 'Not enrolled');

    const attemptCount = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user!.id });
    if (attemptCount >= quiz.maxAttempts) {
      throw new ApiError(429, `Maximum ${quiz.maxAttempts} attempts reached`);
    }

    // Strip correct answers for student
    const sanitized = {
      ...quiz,
      questions: quiz.questions.map(({ text, options }) => ({ text, options })),
    };

    res.json({ success: true, data: { quiz: sanitized, attemptCount, maxAttempts: quiz.maxAttempts } });
  } catch (err) {
    next(err);
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz || !quiz.isPublished) throw new ApiError(404, 'Quiz not found');

    const enrollment = await Enrollment.findOne({ student: req.user!.id, course: quiz.course });
    if (!enrollment) throw new ApiError(403, 'Not enrolled');

    const attemptCount = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user!.id });
    if (attemptCount >= quiz.maxAttempts) throw new ApiError(429, `Max ${quiz.maxAttempts} attempts reached`);

    const { answers } = req.body as { answers: number[] };

    if (answers.length !== quiz.questions.length) {
      throw new ApiError(400, `Expected ${quiz.questions.length} answers, got ${answers.length}`);
    }

    const breakdown = quiz.questions.map((q, i) => ({
      questionIndex: i,
      isCorrect: answers[i] === q.correctIndex,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    }));

    const correctCount = breakdown.filter((b) => b.isCorrect).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user!.id,
      course: quiz.course,
      answers,
      score,
      passed,
      submittedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        score,
        passed,
        correctCount,
        totalQuestions: quiz.questions.length,
        passingScore: quiz.passingScore,
        breakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const myAttempts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id, student: req.user!.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
};
