import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonProgress extends Document {
  student: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  watchedSeconds?: number;
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    watchedSeconds: Number,
  },
  { timestamps: true }
);

lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ student: 1, course: 1 });

export const LessonProgress = mongoose.model<ILessonProgress>('LessonProgress', lessonProgressSchema);
