import { cn } from '../../utils/cn';

type Variant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple';

const VARIANTS: Record<Variant, string> = {
  green:  'bg-green-50 text-green-700 ring-green-600/20',
  yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  red:    'bg-red-50 text-red-700 ring-red-600/20',
  blue:   'bg-blue-50 text-blue-700 ring-blue-600/20',
  gray:   'bg-gray-100 text-gray-600 ring-gray-500/20',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
};

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export default function Badge({ children, variant = 'gray', className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
      VARIANTS[variant],
      className
    )}>
      {children}
    </span>
  );
}
