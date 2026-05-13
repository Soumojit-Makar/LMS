import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category.model';
import { slugify } from '../utils/slugify';
import { ApiError } from '../utils/ApiError';

export const listCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, icon } = req.body;
    const slug = slugify(name);
    const category = await Category.create({ name, slug, description, icon });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates: Record<string, any> = {};
    const allowed = ['name', 'description', 'icon', 'isActive'];
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (req.body.name) updates.slug = slugify(req.body.name);

    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!category) throw new ApiError(404, 'Category not found');
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) throw new ApiError(404, 'Category not found');
    res.json({ success: true, message: 'Category deactivated' });
  } catch (err) {
    next(err);
  }
};
