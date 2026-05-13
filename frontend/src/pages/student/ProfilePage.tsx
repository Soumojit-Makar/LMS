import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, CreditCard, Key } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { paymentService } from '../../services/payment.service';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { queryClient } from '../../lib/queryClient';
import toast from 'react-hot-toast';

const profileSchema = z.object({ name: z.string().min(2), bio: z.string().max(500).optional() });
const pwSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) });

export default function ProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'payments' | 'password'>('profile');

  const { register: rp, handleSubmit: hp, formState: { errors: ep, isSubmitting: isp } } = useForm({
    resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || '', bio: '' },
  });
  const { register: rpw, handleSubmit: hpw, reset: resetPw, formState: { errors: epw, isSubmitting: ispw } } = useForm({
    resolver: zodResolver(pwSchema),
  });

  const { data: txData } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: () => paymentService.myTransactions(),
    enabled: tab === 'payments',
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => authService.me().then(() => data),
    onSuccess: () => toast.success('Profile updated'),
  });

  const onProfileSubmit = async (data: any) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) { setAuth(json.data.user, accessToken!); toast.success('Profile updated'); }
      else toast.error(json.message);
    } catch { toast.error('Update failed'); }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      await authService.changePassword(data);
      toast.success('Password changed. Please log in again.');
      resetPw();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const tabs = [['profile', User, 'Profile'], ['payments', CreditCard, 'Payments'], ['password', Key, 'Password']] as const;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={hp(onProfileSubmit)} className="card p-6 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
              {user?.name[0]}
            </div>
            <div><p className="font-semibold text-gray-900">{user?.name}</p><p className="text-sm text-gray-500">{user?.email}</p></div>
          </div>
          <div>
            <label className="label">Full name</label>
            <input {...rp('name')} className="input" />
            {ep.name && <p className="mt-1 text-xs text-red-500">{ep.name.message}</p>}
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea {...rp('bio')} rows={3} className="input resize-none" placeholder="Tell us about yourself…" />
          </div>
          <button type="submit" disabled={isp} className="btn-primary">{isp ? 'Saving…' : 'Save changes'}</button>
        </form>
      )}

      {tab === 'payments' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Payment History</h2></div>
          {txData?.data?.data?.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No transactions yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {txData?.data?.data?.map((t: any) => (
                <div key={t._id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.course?.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(t.createdAt)} · {t.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(t.amount)}</p>
                    <span className={`text-xs ${t.status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'password' && (
        <form onSubmit={hpw(onPasswordSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="label">Current password</label>
            <input {...rpw('currentPassword')} type="password" className="input" />
            {epw.currentPassword?.message && (
              <p className="mt-1 text-xs text-red-500">
                {String(epw.currentPassword.message)}
              </p>
            )}
          </div>
          <div>
            <label className="label">New password</label>
            <input {...rpw('newPassword')} type="password" className="input" />
            {epw.newPassword?.message && (
              <p className="mt-1 text-xs text-red-500">
                {String(epw.newPassword.message)}
              </p>
            )}
          </div>
          <button type="submit" disabled={ispw} className="btn-primary">{ispw ? 'Updating…' : 'Update password'}</button>
        </form>
      )}
    </div>
  );
}