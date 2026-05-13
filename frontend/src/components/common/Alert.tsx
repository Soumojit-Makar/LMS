import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const CONFIGS = {
  info:    { icon: Info,         bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800'  },
  success: { icon: CheckCircle,  bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800' },
  warning: { icon: AlertCircle,  bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-800' },
  error:   { icon: XCircle,      bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800'   },
};

interface Props {
  variant?:     AlertVariant;
  title?:       string;
  message:      string;
  dismissible?: boolean;
  className?:   string;
}

export default function Alert({ variant = 'info', title, message, dismissible, className }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const { icon: Icon, bg, border, text } = CONFIGS[variant];

  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-4', bg, border, className)}>
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', text)} />
      <div className="flex-1">
        {title && <p className={cn('font-semibold text-sm', text)}>{title}</p>}
        <p className={cn('text-sm', text, title && 'mt-0.5')}>{message}</p>
      </div>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className={cn('shrink-0', text)}>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
