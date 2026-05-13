import { Router } from 'express';
import { trainerOverview, trainerCourseAnalytics } from '../controllers/trainer.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.get('/analytics/overview', authenticate, authorize('trainer'), trainerOverview);
router.get('/analytics/courses/:courseId', authenticate, authorize('trainer'), trainerCourseAnalytics);
export default router;
