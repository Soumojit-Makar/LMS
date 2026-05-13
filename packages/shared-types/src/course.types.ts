export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export interface BaseCourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  status: CourseStatus;
  level: CourseLevel;
  pricing: { isFree: boolean; price: number; discountPrice?: number; currency: string };
  thumbnail: { publicId: string; url: string };
  ratingAverage: number;
  ratingCount: number;
  enrollmentCount: number;
  totalDuration: number;
  totalLessons: number;
  createdAt: string;
  updatedAt: string;
}
