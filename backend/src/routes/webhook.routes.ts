import { Router } from 'express';
import { razorpayWebhook, stripeWebhook } from '../controllers/webhook.controller';

const router = Router();
// Raw body middleware applied in index.ts before this router
router.post('/razorpay', razorpayWebhook);
router.post('/stripe', stripeWebhook);
export default router;
