import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizAttempt extends Document {
  quiz: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  answers: number[];
  score: number;
  passed: boolean;
  startedAt: Date;
  submittedAt?: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [Number],
    score: { type: Number, default: 0, min: 0, max: 100 },
    passed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
  },
  { timestamps: true }
);

quizAttemptSchema.index({ quiz: 1, student: 1 });
quizAttemptSchema.index({ student: 1, course: 1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
