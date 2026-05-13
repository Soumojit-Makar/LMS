import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
  value:    number;
  max?:     number;
  size?:    'sm' | 'md' | 'lg';
  onChange?: (v: number) => void;
  readOnly?: boolean;
}

const SIZE = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' };

export default function StarRating({ value, max = 5, size = 'md', onChange, readOnly = false }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={cn('transition-colors', readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110')}
        >
          <Star
            className={cn(
              SIZE[size],
              star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}
