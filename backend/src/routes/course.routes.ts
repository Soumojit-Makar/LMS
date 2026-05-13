import { Router } from 'express';
import { listCourses, getCourse, createCourse, updateCourse, updateCourseStatus, deleteCourse,getCourseByTrainer } from '../controllers/course.controller';
import { getCourseReviews } from '../controllers/review.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.get('/', listCourses);
router.get('/:slug', getCourse);
router.post('/', authenticate, authorize('trainer'), createCourse);
router.patch('/:id', authenticate, authorize('trainer', 'admin'), updateCourse);
router.patch('/:id/status', authenticate, authorize('trainer', 'admin'), updateCourseStatus);
router.delete('/:id', authenticate, authorize('trainer', 'admin'), deleteCourse);
router.get('/:courseId/reviews', getCourseReviews);
router.get('/trainer/:trainerId', authenticate, authorize('trainer'), getCourseByTrainer);
export default router;
