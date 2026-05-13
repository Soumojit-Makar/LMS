import { Router } from 'express';
import { downloadCertificate, checkEligibility } from '../controllers/certificate.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.get('/:courseId/eligibility', authenticate, authorize('student'), checkEligibility);
router.get('/:courseId/download', authenticate, authorize('student'), downloadCertificate);
export default router;
