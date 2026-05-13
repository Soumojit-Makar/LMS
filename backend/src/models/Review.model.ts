import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  course: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  trainerReply?: string;
  repliedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    trainerReply: String,
    repliedAt: Date,
  },
  { timestamps: true }
);

reviewSchema.index({ course: 1, student: 1 }, { unique: true });
reviewSchema.index({ course: 1, rating: -1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
