import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
interface Props { page: number; totalPages: number; onPageChange: (p: number) => void }
export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="btn-secondary py-2 px-3 disabled:opacity-40">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        const p = i + 1;
        return (
          <button key={p} onClick={() => onPageChange(p)} className={cn('h-9 w-9 rounded-xl text-sm font-medium transition-colors', p === page ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50')}>
            {p}
          </button>
        );
      })}
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className="btn-secondary py-2 px-3 disabled:opacity-40">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}