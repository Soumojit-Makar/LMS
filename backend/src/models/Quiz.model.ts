import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface IQuiz extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  passingScore: number;
  timeLimit?: number;
  questions: IQuestion[];
  maxAttempts: number;
  isPublished: boolean;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    options: { type: [String], required: true, validate: [(v: string[]) => v.length >= 2, 'At least 2 options required'] },
    correctIndex: { type: Number, required: true },
    explanation: String,
  },
  { _id: false }
);

const quizSchema = new Schema<IQuiz>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    timeLimit: Number,
    questions: [questionSchema],
    maxAttempts: { type: Number, default: 3 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

quizSchema.index({ course: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
