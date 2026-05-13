import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();
const createSchema = z.object({ name: z.string().min(1).max(100), description: z.string().optional(), icon: z.string().optional() });

router.get('/', listCategories);
router.post('/', authenticate, authorize('admin'), validate(createSchema), createCategory);
router.patch('/:id', authenticate, authorize('admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);
export default router;
