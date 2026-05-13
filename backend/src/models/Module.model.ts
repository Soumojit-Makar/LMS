import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  order: number;
  isPublished: boolean;
}

const moduleSchema = new Schema<IModule>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

moduleSchema.index({ course: 1, order: 1 });

export const Module = mongoose.model<IModule>('Module', moduleSchema);
