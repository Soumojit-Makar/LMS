import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Archive, Globe, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { courseService } from '../../services/course.service';
import PageLoader from '../../components/common/PageLoader';
import Pagination from '../../components/common/Pagination';
import { queryClient } from '../../lib/queryClient';
import { formatDate } from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

export default function CourseModerationPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses', dq, status, page],
    queryFn: () => adminService.courses({ search: dq, status, page, limit: 20 }).then((res) =>{ console.log(res); return res})
       .catch(() => ({ data: [], totalPages: 1 })),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, s }: { id: string; s: string }) => courseService.updateStatus(id, s),
    onSuccess: () => { toast.success('Course status updated'); queryClient.invalidateQueries({ queryKey: ['admin-courses'] }); },
  });

  const courses = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Course Moderation</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search courses…" className="input pl-10" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Course</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Trainer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Enrollments</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((c: any) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{c.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(c.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.trainer?.name}</td>
                  <td className="px-4 py-3">
                    <span className={c.status === 'published' ? 'badge-green' : c.status === 'draft' ? 'badge-yellow' : 'badge-red'}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{c.enrollmentCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={`/courses/${c.slug}`} className="p-1.5 text-gray-400 hover:text-gray-600"><Eye className="h-4 w-4" /></Link>
                      {c.status !== 'published' && <button onClick={() => statusMutation.mutate({ id: c._id, s: 'published' })} className="p-1.5 text-gray-400 hover:text-green-600"><Globe className="h-4 w-4" /></button>}
                      {c.status !== 'archived' && <button onClick={() => statusMutation.mutate({ id: c._id, s: 'archived' })} className="p-1.5 text-gray-400 hover:text-red-500"><Archive className="h-4 w-4" /></button>}
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