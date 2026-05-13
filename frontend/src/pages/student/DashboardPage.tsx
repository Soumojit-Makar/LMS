import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, ArrowRight, Play } from 'lucide-react';
import { enrollmentService } from '../../services/enrollment.service';
import { useAuthStore } from '../../store/useAuthStore';
import PageLoader from '../../components/common/PageLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/format';

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => enrollmentService.myEnrollments(),
  });

  const enrollments = data?.data?.data || [];
  const inProgress = enrollments.filter((e: any) => e.progressPercent < 100);
  const completed = enrollments.filter((e: any) => e.progressPercent === 100);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mt-1">Continue where you left off</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          [BookOpen, 'Enrolled', enrollments.length, 'text-brand-600'],
          [Clock, 'In Progress', inProgress.length, 'text-amber-600'],
          [Award, 'Completed', completed.length, 'text-green-600'],
        ].map(([Icon, label, value, color]: any) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className="rounded-xl bg-gray-50 p-3"><Icon className={`h-5 w-5 ${color}`} /></div>
            <div><p className="text-2xl font-bold font-display text-gray-900">{value}</p><p className="text-sm text-gray-500">{label}</p></div>
          </div>
        ))}
      </div>

      {isLoading ? <PageLoader /> : enrollments.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Browse our catalogue and start your first course today."
          action={<Link to="/courses" className="btn-primary">Browse Courses</Link>} />
      ) : (
        <>
          {inProgress.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display font-semibold text-gray-900 mb-4">Continue Learning</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inProgress.map((e: any) => (
                  <div key={e._id} className="card p-4 flex gap-4">
                    <img src={e.course?.thumbnail?.url || 'https://placehold.co/80x60/e5e7eb/9ca3af'} alt="" className="h-16 w-24 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{e.course?.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Enrolled {formatDate(e.enrolledAt)}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                          <div className="h-1.5 rounded-full bg-brand-600 transition-all" style={{ width: `${e.progressPercent}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 shrink-0">{e.progressPercent}%</span>
                      </div>
                      <Link to={`/learn/${e.course._id}/lessons/first`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                        <Play className="h-3 w-3" /> Continue
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-gray-900 mb-4">Completed Courses</h2>
              <div className="space-y-3">
                {completed.map((e: any) => (
                  <div key={e._id} className="card p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-green-500 shrink-0" />
                      <p className="font-medium text-gray-900 text-sm">{e.course?.title}</p>
                    </div>
                    <Link to={`/certificate/${e.course._id}`} className="btn-secondary text-xs py-1.5 px-3 shrink-0">
                      Certificate
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}