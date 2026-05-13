import { Router } from 'express';
import { createQuiz, updateQuiz, getQuizForStudent, submitQuiz, myAttempts } from '../controllers/quiz.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.post('/', authenticate, authorize('trainer'), createQuiz);
router.patch('/:id', authenticate, authorize('trainer'), updateQuiz);
router.get('/:id', authenticate, authorize('student'), getQuizForStudent);
router.post('/:id/submit', authenticate, authorize('student'), submitQuiz);
router.get('/:id/attempts/me', authenticate, authorize('student'), myAttempts);
export default router;
