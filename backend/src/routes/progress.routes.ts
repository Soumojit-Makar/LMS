import { Router } from 'express';
import { completeLesson, getCourseProgress } from '../controllers/progress.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.post('/lessons/:lessonId/complete', authenticate, authorize('student'), completeLesson);
router.get('/courses/:courseId', authenticate, authorize('student'), getCourseProgress);
export default router;
