import { cn } from '../../utils/cn';

interface Props {
  value:      number;   // 0–100
  size?:      'sm' | 'md' | 'lg';
  color?:     string;
  showLabel?: boolean;
  className?: string;
}

const HEIGHTS = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

export default function ProgressBar({ value, size = 'md', color = 'bg-brand-600', showLabel, className }: Props) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-gray-100 overflow-hidden', HEIGHTS[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1 text-right">{pct}%</p>
      )}
    </div>
  );
}
