import mongoose, { Document, Schema } from 'mongoose';

export type LessonType = 'video' | 'youtube' | 'pdf' | 'text';

export interface ILesson extends Document {
  module: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  title: string;
  type: LessonType;
  order: number;
  isFreePreview: boolean;
  isPublished: boolean;
  content: {
    text?: string;
    // Cloudinary-hosted video
    video?: { publicId: string; url: string; duration?: number; format?: string };
    // PDF
    pdf?: { publicId: string; url: string; filename: string };
    // YouTube — only videoId stored, NEVER the full URL in DB
    youtube?: { videoId: string; duration?: number };
  };
  duration: number;
}

const lessonSchema = new Schema<ILesson>(
  {
    module:        { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    course:        { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title:         { type: String, required: true },
    type:          { type: String, enum: ['video', 'youtube', 'pdf', 'text'], required: true },
    order:         { type: Number, required: true, default: 0 },
    isFreePreview: { type: Boolean, default: false },
    isPublished:   { type: Boolean, default: false },
    content: {
      text:    String,
      video:   { publicId: String, url: String, duration: Number, format: String },
      pdf:     { publicId: String, url: String, filename: String },
      // videoId only — full URL never persisted
      youtube: { videoId: String, duration: Number },
    },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ course: 1 });

export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);