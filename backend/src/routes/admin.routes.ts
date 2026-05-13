import { Router } from 'express';
import { listUsers, changeUserRole, toggleUserActive, approveTrainer, adminListCourses, adminOverview, adminTransactions } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
const guard = [authenticate, authorize('admin')];
router.get('/users', ...guard, listUsers);
router.patch('/users/:id/role', ...guard, changeUserRole);
router.patch('/users/:id/toggle-active', ...guard, toggleUserActive);
router.patch('/trainers/:id/approve', ...guard, approveTrainer);
router.get('/courses', ...guard, adminListCourses);
router.get('/analytics/overview', ...guard, adminOverview);
router.get('/transactions', ...guard, adminTransactions);
export default router;
