import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open:        boolean;
  title:       string;
  message:     string;
  confirmText?: string;
  danger?:     boolean;
  onConfirm:   () => void;
  onCancel:    () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmText = 'Confirm', danger, onConfirm, onCancel,
}: Props) {
  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`rounded-xl p-3 ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle className={`h-6 w-6 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
          <h3 className="font-display font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}  className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
