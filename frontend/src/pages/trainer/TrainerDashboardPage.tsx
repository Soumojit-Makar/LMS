import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DollarSign, Star, PlusCircle, Eye, Edit } from 'lucide-react';
import { trainerService } from '../../services/trainer.service';
import { courseService } from '../../services/course.service';
import { useAuthStore } from '../../store/useAuthStore';
import StatCard from '../../components/common/StatCard';
import PageLoader from '../../components/common/PageLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/format';

export default function TrainerDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['trainer-overview'],
    queryFn: trainerService.overview,
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['trainer-courses'],
    queryFn: () => {
      if (!user?._id) {
        return Promise.resolve({ data: { data: { courses: [] } } });
      }
      return courseService.getByTrainer(user._id, { limit: 10 }).then((res) => res)
        .catch(() => ({ data: { data: { courses: [] } } }));
    },
  });

  const courses = coursesData?.data?.data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your courses and track performance</p>
        </div>
        <Link to="/trainer/courses/new" className="btn-primary gap-2">
          <PlusCircle className="h-4 w-4" /> New Course
        </Link>
      </div>

      {statsLoading ? <PageLoader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Courses" value={stats?.totalCourses || 0} icon={BookOpen} />
          <StatCard title="Total Enrollments" value={stats?.totalEnrollments || 0} icon={Users} color="text-green-600" />
          <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="text-amber-600" />
          <StatCard title="Avg. Rating" value={`${stats?.averageRating || 0} ★`} icon={Star} color="text-yellow-500" />
        </div>
      )}

      <div>
        <h2 className="font-display font-semibold text-gray-900 mb-4">Your Courses</h2>
        {coursesLoading ? <PageLoader /> : courses.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course and start teaching."
            action={<Link to="/trainer/courses/new" className="btn-primary">Create Course</Link>} />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Course</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Enrollments</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Rating</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((c: any) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={c.thumbnail?.url || 'https://placehold.co/48x36/e5e7eb/9ca3af'} alt="" className="h-9 w-12 rounded-lg object-cover hidden sm:block" />
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{c.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={c.status === 'published' ? 'badge-green' : c.status === 'draft' ? 'badge-yellow' : 'badge-gray'}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{c.enrollmentCount}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {c.ratingAverage > 0 ? `${c.ratingAverage.toFixed(1)} ★` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/courses/${c.slug}`} className="p-1.5 text-gray-400 hover:text-gray-600"><Eye className="h-4 w-4" /></Link>
                        <Link to={`/trainer/courses/${c._id}/${c.slug}/edit`} className="p-1.5 text-gray-400 hover:text-brand-600"><Edit className="h-4 w-4" /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}