import { LucideIcon } from 'lucide-react';
interface Props { title: string; value: string | number; icon: LucideIcon; color?: string; sub?: string }
export default function StatCard({ title, value, icon: Icon, color = 'text-brand-600', sub }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold font-display text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`rounded-xl bg-gray-50 p-3`}><Icon className={`h-5 w-5 ${color}`} /></div>
      </div>
    </div>
  );
}