import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingUp, Users, DollarSign, Star } from 'lucide-react';
import { trainerService } from '../../services/trainer.service';
import StatCard from '../../components/common/StatCard';
import PageLoader from '../../components/common/PageLoader';
import { formatCurrency } from '../../utils/format';

export default function TrainerAnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['trainer-overview'],
    queryFn: trainerService.overview,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
      <p className="text-gray-500 mb-8">Your overall performance metrics</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Courses" value={stats?.totalCourses || 0} icon={BarChart2} />
        <StatCard title="Published" value={stats?.publishedCourses || 0} icon={TrendingUp} color="text-green-600" />
        <StatCard title="Draft" value={stats?.draftCourses || 0} icon={BarChart2} color="text-yellow-600" />
        <StatCard title="Total Enrollments" value={stats?.totalEnrollments || 0} icon={Users} color="text-brand-600" />
        <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="text-emerald-600" />
        <StatCard title="Avg. Rating" value={stats?.averageRating ? `${stats.averageRating} / 5` : 'N/A'} icon={Star} color="text-amber-500" />
      </div>
      <div className="card p-8 text-center text-gray-400">
        <BarChart2 className="h-10 w-10 mx-auto mb-3 text-gray-200" />
        <p className="text-sm">Detailed charts coming soon. Connect a charting library (e.g. Recharts) to visualise enrollment trends.</p>
      </div>
    </div>
  );
}