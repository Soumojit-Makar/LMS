import { Router } from 'express';
import { createModule, updateModule, deleteModule, reorderModules, listModulesForCourse } from '../controllers/module.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.get('/',           authenticate, listModulesForCourse);          // ?course=<id>
router.post('/',          authenticate, authorize('trainer'), createModule);
router.patch('/:id',      authenticate, authorize('trainer'), updateModule);
router.delete('/:id',     authenticate, authorize('trainer'), deleteModule);
router.post('/reorder',   authenticate, authorize('trainer'), reorderModules);
export default router;
