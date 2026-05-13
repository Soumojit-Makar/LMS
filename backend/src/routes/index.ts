import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import courseRoutes from './course.routes';
import moduleRoutes from './module.routes';
import lessonRoutes from './lesson.routes';
import enrollmentRoutes from './enrollment.routes';
import progressRoutes from './progress.routes';
import quizRoutes from './quiz.routes';
import reviewRoutes from './review.routes';
import mediaRoutes from './media.routes';
import paymentRoutes from './payment.routes';
import webhookRoutes from './webhook.routes';
import trainerRoutes from './trainer.routes';
import adminRoutes from './admin.routes';
import certificateRoutes from './certificate.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/progress', progressRoutes);
router.use('/quizzes', quizRoutes);
router.use('/reviews', reviewRoutes);
router.use('/media', mediaRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/trainer', trainerRoutes);
router.use('/admin', adminRoutes);
router.use('/certificates', certificateRoutes);

export default router;
