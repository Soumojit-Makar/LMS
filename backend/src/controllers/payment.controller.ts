import crypto from 'crypto';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { PaymentTransaction } from '../models/PaymentTransaction.model';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found');
    if (course.status !== 'published') throw new ApiError(400, 'Course is not available');
    if (course.pricing.isFree) throw new ApiError(400, 'Use /api/enrollments for free courses');

    const existing = await Enrollment.findOne({ student: req.user!.id, course: courseId });
    if (existing) throw new ApiError(409, 'Already enrolled in this course');

    const amount = course.pricing.discountPrice ?? course.pricing.price;
    const amountPaise = Math.round(amount * 100);
    const receipt = `rcpt_${uuidv4().replace(/-/g, '').slice(0, 20)}`;

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
    });

    await PaymentTransaction.create({
      student: req.user!.id,
      course: courseId,
      provider: 'razorpay',
      providerOrderId: order.id,
      status: 'pending',
      amount,
      currency: 'INR',
      receipt,
    });

    res.json({
      success: true,
      data: {
        provider: 'razorpay',
        orderId: order.id,
        amount: amountPaise,
        currency: 'INR',
        keyId: env.RAZORPAY_KEY_ID,
        receipt,
        courseName: course.title,
        courseId,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      throw new ApiError(400, 'Payment signature verification failed');
    }

    const txn = await PaymentTransaction.findOne({ providerOrderId: razorpay_order_id });
    if (!txn) throw new ApiError(404, 'Transaction not found');

    // Idempotent - already processed
    if (txn.status === 'paid') {
      return res.json({ success: true, data: { enrolled: true, alreadyProcessed: true } });
    }

    txn.status = 'paid';
    txn.providerPaymentId = razorpay_payment_id;
    await txn.save();

    await Enrollment.findOneAndUpdate(
      { student: txn.student, course: txn.course },
      { student: txn.student, course: txn.course, paymentTransaction: txn._id, enrolledAt: new Date() },
      { upsert: true, new: true }
    );

    await Course.findByIdAndUpdate(txn.course, { $inc: { enrollmentCount: 1 } });

    res.json({ success: true, data: { enrolled: true } });
  } catch (err) {
    next(err);
  }
};

export const myTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transactions = await PaymentTransaction.find({ student: req.user!.id })
      .populate('course', 'title slug thumbnail')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};
