import { LucideIcon } from 'lucide-react';
interface Props { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }
export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-2xl bg-gray-100 p-5"><Icon className="h-8 w-8 text-gray-400" /></div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}