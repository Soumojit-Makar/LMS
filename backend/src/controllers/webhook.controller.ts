import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { PaymentTransaction } from '../models/PaymentTransaction.model';
import { Enrollment } from '../models/Enrollment.model';
import { Course } from '../models/Course.model';
import { env } from '../config/env';

export const razorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody as string;

    if (!signature || !rawBody) {
      return res.status(400).json({ error: 'Missing signature or body' });
    }

    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expected !== signature) {
      console.warn('[Webhook] Invalid Razorpay signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('[Webhook] Razorpay event:', event.event);

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment) return res.json({ received: true });

      const orderId = payment.order_id;
      const paymentId = payment.id;

      const txn = await PaymentTransaction.findOne({ providerOrderId: orderId });
      if (!txn) {
        console.warn('[Webhook] Unknown order:', orderId);
        return res.json({ received: true });
      }

      if (txn.status !== 'paid') {
        txn.status = 'paid';
        txn.providerPaymentId = paymentId;
        txn.webhookVerified = true;
        await txn.save();

        await Enrollment.findOneAndUpdate(
          { student: txn.student, course: txn.course },
          { student: txn.student, course: txn.course, paymentTransaction: txn._id, enrolledAt: new Date() },
          { upsert: true }
        );

        await Course.findByIdAndUpdate(txn.course, { $inc: { enrollmentCount: 1 } });
        console.log('[Webhook] Enrollment activated for order:', orderId);
      } else {
        // Verify was called first, just mark webhook as verified
        await PaymentTransaction.findByIdAndUpdate(txn._id, { webhookVerified: true });
      }
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await PaymentTransaction.findOneAndUpdate(
          { providerOrderId: payment.order_id },
          { status: 'failed' }
        );
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  // Stripe webhook stub — implement when switching to Stripe
  console.log('[Webhook] Stripe event received (not configured)');
  res.json({ received: true });
};
