import { Router } from 'express';
import { signUpload, completeUpload, deleteMedia } from '../controllers/media.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.post('/sign-upload', authenticate, authorize('trainer', 'student'), signUpload);
router.post('/complete', authenticate, authorize('trainer'), completeUpload);
router.delete('/:id', authenticate, authorize('trainer', 'admin'), deleteMedia);
export default router;
