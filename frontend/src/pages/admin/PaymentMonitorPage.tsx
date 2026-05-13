import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { adminService } from '../../services/admin.service';
import PageLoader from '../../components/common/PageLoader';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/format';

export default function PaymentMonitorPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', page, status],
    queryFn: () => adminService.transactions({ page, limit: 20, status }),
  });

  const txns = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Payment Monitor</h1>
      <div className="mb-6">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Course</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {txns.map((t: any) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{t.student?.name}</p>
                    <p className="text-xs text-gray-500">{t.student?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell truncate max-w-[160px]">{t.course?.title}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={t.status === 'paid' ? 'badge-green' : t.status === 'pending' ? 'badge-yellow' : t.status === 'failed' ? 'badge-red' : 'badge-gray'}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(t.createdAt)}</td>
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