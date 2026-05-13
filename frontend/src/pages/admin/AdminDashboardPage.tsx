import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, DollarSign, GraduationCap } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import StatCard from '../../components/common/StatCard';
import PageLoader from '../../components/common/PageLoader';
import { formatCurrency } from '../../utils/format';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-overview'], queryFn: adminService.overview });
  if (isLoading) return <PageLoader />;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Platform Overview</h1>
      <p className="text-gray-500 mb-8">Real-time metrics across the platform</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Students" value={stats?.totalStudents ?? 0} icon={Users} />
        <StatCard title="Trainers" value={stats?.totalTrainers ?? 0} icon={GraduationCap} color="text-purple-600" />
        <StatCard title="Courses" value={stats?.totalPublishedCourses ?? 0} icon={BookOpen} color="text-brand-600" />
        <StatCard title="Enrollments" value={stats?.totalEnrollments ?? 0} icon={Users} color="text-green-600" />
        <StatCard title="Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} icon={DollarSign} color="text-amber-600" />
      </div>
    </div>
  );
}