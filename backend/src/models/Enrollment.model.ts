import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  paymentTransaction?: mongoose.Types.ObjectId;
  enrolledAt: Date;
  completedAt?: Date;
  progressPercent: number;
  certificateIssued: boolean;
  certificateIssuedAt?: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    paymentTransaction: { type: Schema.Types.ObjectId, ref: 'PaymentTransaction' },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: Date,
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    certificateIssued: { type: Boolean, default: false },
    certificateIssuedAt: Date,
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ student: 1 });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
