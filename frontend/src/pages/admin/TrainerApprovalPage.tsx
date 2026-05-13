import { useQuery, useMutation } from '@tanstack/react-query';
import { UserCheck, UserX } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import PageLoader from '../../components/common/PageLoader';
import EmptyState from '../../components/common/EmptyState';
import { queryClient } from '../../lib/queryClient';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

export default function TrainerApprovalPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['pending-trainers'],
    queryFn: () => adminService.users({ role: 'trainer', limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) => adminService.approveTrainer(id, approved),
    onSuccess: (_, vars) => {
      toast.success(vars.approved ? 'Trainer approved' : 'Trainer rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-trainers'] });
    },
  });

  const trainers = (data?.data || []);
  const pending = trainers.filter((u: any) => !u.trainerApproved);
  const approved = trainers.filter((u: any) => u.trainerApproved);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Trainer Approval</h1>
      {pending.length === 0 && approved.length === 0 ? (
        <EmptyState icon={UserCheck} title="No trainers yet" description="Trainer registrations will appear here." />
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-gray-900 mb-3">Pending Approval ({pending.length})</h2>
              <div className="card overflow-hidden">
                {pending.map((u: any) => (
                  <div key={u._id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email} · Applied {formatDate(u.trainerAppliedAt || u.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveMutation.mutate({ id: u._id, approved: true })} className="btn-primary text-xs py-1.5 px-3 gap-1">
                        <UserCheck className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => approveMutation.mutate({ id: u._id, approved: false })} className="btn-danger text-xs py-1.5 px-3 gap-1">
                        <UserX className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {approved.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Approved Trainers ({approved.length})</h2>
              <div className="card overflow-hidden">
                {approved.map((u: any) => (
                  <div key={u._id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <span className="badge-green">Approved</span>
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