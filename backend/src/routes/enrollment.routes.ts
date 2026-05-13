import { Router } from 'express';
import { enroll, myEnrollments, courseEnrollments } from '../controllers/enrollment.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.post('/', authenticate, authorize('student'), enroll);
router.get('/me', authenticate, authorize('student'), myEnrollments);
router.get('/:courseId', authenticate, authorize('trainer', 'admin'), courseEnrollments);
export default router;
