import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { Module } from '../models/Module.model';
import { Lesson } from '../models/Lesson.model';
import { Course } from '../models/Course.model';
import { ApiError } from '../utils/ApiError';

async function assertTrainerOwns(courseId: string, trainerId: string) {
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found');
  if (course.trainer.toString() !== trainerId) throw new ApiError(403, 'Not authorized');
  return course;
}

export const createModule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { course, title, order } = req.body;
    await assertTrainerOwns(course, req.user!.id);
    const mod = await Module.create({ course, title, order });

    res.status(201).json({ success: true, data: mod });
  } catch (err) {
    next(err);
  }
};

export const updateModule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) throw new ApiError(404, 'Module not found');
    await assertTrainerOwns(mod.course.toString(), req.user!.id);

    const { title, isPublished } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (isPublished !== undefined) updates.isPublished = isPublished;

    const updated = await Module.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteModule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) throw new ApiError(404, 'Module not found');
    await assertTrainerOwns(mod.course.toString(), req.user!.id);

    await Lesson.deleteMany({ module: mod._id });
    await Module.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Module and its lessons deleted' });
  } catch (err) {
    next(err);
  }
};

export const reorderModules = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId, orderedIds } = req.body;
    await assertTrainerOwns(courseId, req.user!.id);

    const ops = (orderedIds as string[]).map((id, index) =>
      Module.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(ops);
    res.json({ success: true, message: 'Modules reordered' });
  } catch (err) {
    next(err);
  }
};

// GET /api/modules?course=<courseId>
export const listModulesForCourse = async (req: any, res: any, next: any) => {
  try {
    const { course } = req.query;
    if (!course) throw new ApiError(400, 'course query param required');
    const modules = await Module.find({ course }).sort({ order: 1 }).lean();
    const { Lesson } = await import('../models/Lesson.model');
    const lessons = await Lesson.find({ course })
      .sort({ order: 1 })
      .select('-content.youtube -content.video.url -content.pdf.url')
      .lean();
    const result = modules.map((m) => ({
      ...m,
      lessons: lessons.filter((l) => l.module.toString() === (m._id as any).toString()),
    }));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};
