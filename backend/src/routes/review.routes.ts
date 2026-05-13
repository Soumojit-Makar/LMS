import { Router } from 'express';
import { createReview, replyToReview } from '../controllers/review.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.post('/', authenticate, authorize('student'), createReview);
router.patch('/:id/reply', authenticate, authorize('trainer'), replyToReview);
export default router;
