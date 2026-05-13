import { Router } from 'express';
import { createOrder, verifyPayment, myTransactions } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
router.post('/create-order', authenticate, authorize('student'), createOrder);
router.post('/verify', authenticate, authorize('student'), verifyPayment);
router.get('/my-transactions', authenticate, myTransactions);
export default router;
