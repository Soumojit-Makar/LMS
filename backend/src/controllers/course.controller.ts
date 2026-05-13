import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { Course } from '../models/Course.model';
import { Module } from '../models/Module.model';
import { Lesson } from '../models/Lesson.model';
import { Enrollment } from '../models/Enrollment.model';
import { ApiError } from '../utils/ApiError';
import { uniqueSlug } from '../utils/slugify';
import { paginate, paginatedResponse } from '../utils/pagination';

export const listCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, category, level, isFree, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query as any;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const filter: Record<string, any> = { status: 'published' };
    if (q) filter.$text = { $search: q };
    if (category) filter['category'] = category;
    if (level) filter.level = level;
    if (isFree !== undefined) filter['pricing.isFree'] = isFree === 'true';
    if (minPrice) filter['pricing.price'] = { ...filter['pricing.price'], $gte: Number(minPrice) };
    if (maxPrice) filter['pricing.price'] = { ...filter['pricing.price'], $lte: Number(maxPrice) };

    const sortMap: Record<string, any> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      ratingAverage: { ratingAverage: -1 },
      popular: { enrollmentCount: -1 },
      price_asc: { 'pricing.price': 1 },
      price_desc: { 'pricing.price': -1 },
    };
    const sortOrder = sortMap[sort as string] || { createdAt: -1 };

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('category', 'name slug icon')
        .populate('trainer', 'name avatar')
        .sort(sortOrder)
        .skip(skip)
        .limit(lim)
        .lean(),
      Course.countDocuments(filter),
    ]);

    res.json({ success: true, data: paginatedResponse(courses, total, pg, lim) });
  } catch (err) {
    next(err);
  }
};

export const getCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, status: { $ne: 'archived' } })
      .populate('category', 'name slug icon')
      .populate('trainer', 'name avatar bio')
      .lean();

    if (!course) throw new ApiError(404, 'Course not found');

    const modules = await Module.find({ course: course._id, isPublished: true })
      .sort({ order: 1 })
      .lean();

    const lessons = await Lesson.find({ course: course._id, isPublished: true })
      .sort({ order: 1 })
      .select('-content.video.url -content.pdf.url') // strip secure URLs from public listing
      .lean();

    const curriculum = modules.map((m) => ({
      ...m,
      lessons: lessons.filter((l) => l.module.toString() === m._id.toString()),
    }));

    res.json({ success: true, data: { ...course, curriculum } });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, shortDescription, category, level, language, thumbnail, pricing, tags, requirements, outcomes } = req.body;
    const slug = uniqueSlug(title);

    const course = await Course.create({
      title, slug, description, shortDescription,
      category, level, language, thumbnail, pricing,
      tags, requirements, outcomes,
      trainer: req.user!.id,
      status: 'draft',
    });

    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found');

    // Trainers can only edit their own courses
    if (req.user!.role === 'trainer' && course.trainer.toString() !== req.user!.id) {
      throw new ApiError(403, 'Not authorized to edit this course');
    }

    const allowed = ['title', 'description', 'shortDescription', 'category', 'level', 'language', 'thumbnail', 'promoVideo', 'pricing', 'tags', 'requirements', 'outcomes', 'certificateEnabled', 'passingScore'];
    const updates: Record<string, any> = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const updated = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const updateCourseStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    
    const { status } = req.body;
    const course = await Course.findById(req.params.id);
    console.log(course, status,);
    if (!course) throw new ApiError(404, 'Course not found');

    if (req.user!.role === 'trainer' && course.trainer.toString() !== req.user!.id) {
      throw new ApiError(403, 'Not authorized');
    }

    if (status === 'published') {
      const lessonCount = await Lesson.countDocuments({ course: course._id, isPublished: true });
      if (lessonCount === 0) throw new ApiError(400, 'Cannot publish: course has no published lessons');
    }

    course.status = status;
    await course.save();
    res.json({ success: true, data: course });
  } catch (err) {
    console.error(err);
    console.log('Error archiving course:', err instanceof Error ? err.message : err);
    next(err);
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found');

    if (req.user!.role === 'trainer' && course.trainer.toString() !== req.user!.id) {
      throw new ApiError(403, 'Not authorized');
    }

    course.status = 'archived';
    await course.save();
    res.json({ success: true, message: 'Course archived' });
  } catch (err) {
    
    next(err);
  }
};
export const getCourseByTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q, category, level, isFree, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query as any;
    const { skip, limit: lim, page: pg } = paginate(page, limit);
    const filter: Record<string, any> = { trainer: req.user!.id};
    if (q) filter.$text = { $search: q };
    if (category) filter['category'] = category;
    if (level) filter.level = level;
    if (isFree !== undefined) filter['pricing.isFree'] = isFree === 'true';
    if (minPrice) filter['pricing.price'] = { ...filter['pricing.price'], $gte: Number(minPrice) };
    if (maxPrice) filter['pricing.price'] = { ...filter['pricing.price'], $lte: Number(maxPrice) };

    const sortMap: Record<string, any> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      ratingAverage: { ratingAverage: -1 },
      popular: { enrollmentCount: -1 },
      price_asc: { 'pricing.price': 1 },
      price_desc: { 'pricing.price': -1 },
    };
    const sortOrder = sortMap[sort as string] || { createdAt: -1 };

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('category', 'name slug icon')
        .populate('trainer', 'name avatar')
        .sort(sortOrder)
        .skip(skip)
        .limit(lim)
        .lean(),
      Course.countDocuments(filter),
    ]);

    res.json({ success: true, data: paginatedResponse(courses, total, pg, lim) });
  } catch (err) {
    next(err);
  }
} 