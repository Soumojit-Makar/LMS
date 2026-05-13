import mongoose, { Document, Schema } from 'mongoose';

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  trainer: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  status: CourseStatus;
  level: CourseLevel;
  language: string;
  thumbnail: { publicId: string; url: string };
  promoVideo?: { publicId: string; url: string; duration?: number };
  pricing: {
    isFree: boolean;
    price: number;
    discountPrice?: number;
    currency: string;
  };
  tags: string[];
  requirements: string[];
  outcomes: string[];
  totalDuration: number;
  totalLessons: number;
  enrollmentCount: number;
  ratingAverage: number;
  ratingCount: number;
  certificateEnabled: boolean;
  passingScore: number;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 300, default: '' },
    trainer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    language: { type: String, default: 'English' },
    thumbnail: {
      publicId: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    promoVideo: { publicId: String, url: String, duration: Number },
    pricing: {
      isFree: { type: Boolean, default: false },
      price: { type: Number, default: 0 },
      discountPrice: Number,
      currency: { type: String, default: 'INR' },
    },
    tags: [String],
    requirements: [String],
    outcomes: [String],
    totalDuration: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    certificateEnabled: { type: Boolean, default: true },
    passingScore: { type: Number, default: 70 },
  },
  { timestamps: true }
);

courseSchema.index({ slug: 1 });
courseSchema.index({ status: 1, category: 1 });
courseSchema.index({ trainer: 1, status: 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
