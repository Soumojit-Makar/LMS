import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Search } from 'lucide-react';
import { useState } from 'react';
import { enrollmentService } from '../../services/enrollment.service';
import PageLoader from '../../components/common/PageLoader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';

export default function StudentRosterPage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const dq = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['enrollments', id, page, dq],
    queryFn: () => enrollmentService.courseEnrollments(id!, { page, limit: 20, search: dq }),
  });

  const enrollments = data?.data?.data?.data || [];
  const totalPages = data?.data?.data?.totalPages || 1;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Student Roster</h1>
      <div className="relative mb-6 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" className="input pl-10" />
      </div>
      {isLoading ? <PageLoader /> : enrollments.length === 0 ? (
        <EmptyState icon={Users} title="No students yet" description="Students who enroll will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Enrolled</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enrollments.map((e: any) => (
                <tr key={e._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 shrink-0">
                        {e.student?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{e.student?.name}</p>
                        <p className="text-xs text-gray-500">{e.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDate(e.enrolledAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 max-w-[80px]">
                        <div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${e.progressPercent}%` }} />
                      </div>
                      <span className="text-xs text-gray-600">{e.progressPercent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}