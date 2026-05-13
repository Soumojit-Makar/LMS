import { Router } from 'express';
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  getStreamUrl,
  getPlaybackFrame,
} from '../controllers/lesson.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.post('/',           authenticate, authorize('trainer'), createLesson);
router.patch('/:id',       authenticate, authorize('trainer'), updateLesson);
router.delete('/:id',      authenticate, authorize('trainer'), deleteLesson);
router.post('/reorder',    authenticate, authorize('trainer'), reorderLessons);

// Student gets a short-lived playback token (videoId never exposed)
router.get('/:id/stream-url',      authenticate, getStreamUrl);

// Student loads actual player HTML via token — HTML served server-side
router.get('/:id/playback-frame',   getPlaybackFrame);

export default router;