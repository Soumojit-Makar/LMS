import { Link } from 'react-router-dom';
import { Star, Users, Clock } from 'lucide-react';
import { formatCurrency, formatDuration } from '../../utils/format';

export interface Course {
  _id: string;
  slug: string; title: string; thumbnail: { url: string }; shortDescription: string;
  trainer: { name: string }; pricing: { isFree: boolean; price: number; discountPrice?: number };
  ratingAverage: number; ratingCount: number; enrollmentCount: number; totalDuration: number; level: string;
}

export default function CourseCard({ course }: { course: Course }) {
  const price = course.pricing.isFree ? 'Free' : formatCurrency(course.pricing.discountPrice ?? course.pricing.price);
  return (
    <Link to={`/courses/${course.slug}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img src={course.thumbnail?.url || 'https://placehold.co/400x225/e5e7eb/9ca3af?text=Course'} alt={course.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold ${course.pricing.isFree ? 'bg-green-500 text-white' : 'bg-white text-gray-900 shadow'}`}>{price}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1">
          <span className="badge-gray capitalize">{course.level}</span>
        </div>
        <h3 className="font-display font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">{course.title}</h3>
        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{course.shortDescription}</p>
        <p className="mt-2 text-xs text-gray-500">by {course.trainer?.name}</p>
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-gray-700">{course.ratingAverage.toFixed(1)}</span>
            <span>({course.ratingCount})</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrollmentCount}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(course.totalDuration)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}