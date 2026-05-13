import { Link } from 'react-router-dom';
import { Play, Award } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import { formatDate } from '../../utils/format';

interface Props {
  enrollment: {
    course: { _id: string; title: string; slug: string; thumbnail?: { url: string } };
    progressPercent: number;
    enrolledAt: string;
    completedAt?: string;
  };
  firstLessonId?: string;
}

export default function CourseProgress({ enrollment, firstLessonId }: Props) {
  const { course, progressPercent, enrolledAt, completedAt } = enrollment;

  return (
    <div className="card p-4 flex gap-4">
      <img
        src={course.thumbnail?.url || 'https://placehold.co/80x56/e5e7eb/9ca3af?text=Course'}
        alt={course.title}
        className="h-14 w-20 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{course.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">Enrolled {formatDate(enrolledAt)}</p>
        <div className="mt-2">
          <ProgressBar value={progressPercent} size="sm" showLabel />
        </div>
        <div className="mt-2 flex items-center gap-3">
          {completedAt ? (
            <Link to={`/certificate/${course._id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700">
              <Award className="h-3.5 w-3.5" /> Get Certificate
            </Link>
          ) : (
            <Link
              to={`/learn/${course._id}/lessons/${firstLessonId || 'first'}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <Play className="h-3.5 w-3.5" /> {progressPercent > 0 ? 'Continue' : 'Start'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
