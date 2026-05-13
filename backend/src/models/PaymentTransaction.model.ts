import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentProvider = 'razorpay' | 'stripe';

export interface IPaymentTransaction extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  provider: PaymentProvider;
  providerOrderId: string;
  providerPaymentId?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  receipt: string;
  refundId?: string;
  refundedAt?: Date;
  webhookVerified: boolean;
  metadata?: Record<string, unknown>;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    provider: { type: String, enum: ['razorpay', 'stripe'], required: true },
    providerOrderId: { type: String, required: true, unique: true },
    providerPaymentId: String,
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    receipt: { type: String, required: true, unique: true },
    refundId: String,
    refundedAt: Date,
    webhookVerified: { type: Boolean, default: false },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

paymentTransactionSchema.index({ student: 1, course: 1 });
paymentTransactionSchema.index({ providerOrderId: 1 });
paymentTransactionSchema.index({ status: 1 });

export const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', paymentTransactionSchema);
