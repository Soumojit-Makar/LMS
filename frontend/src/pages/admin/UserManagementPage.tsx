import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Shield, Ban } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useDebounce } from '../../hooks/useDebounce';
import PageLoader from '../../components/common/PageLoader';
import Pagination from '../../components/common/Pagination';
import { queryClient } from '../../lib/queryClient';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', dq, role, page],
    queryFn: () => adminService.users({ search: dq, role, page, limit: 20 }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminService.changeRole(id, role),
    onSuccess: () => { toast.success('Role updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleActive(id),
    onSuccess: () => { toast.success('User status updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
  });

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">User Management</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users…" className="input pl-10" />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All roles</option>
          <option value="student">Students</option>
          <option value="trainer">Trainers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u: any) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => roleMutation.mutate({ id: u._id, role: e.target.value })}
                      className="input py-1 text-xs w-auto">
                      <option value="student">Student</option>
                      <option value="trainer">Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleMutation.mutate(u._id)} className="p-1.5 text-gray-400 hover:text-red-500">
                      <Ban className="h-4 w-4" />
                    </button>
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