import { useRef, useState, DragEvent } from 'react';
import { Upload, Loader2, CheckCircle, X } from 'lucide-react';
import { useUpload, UploadResult } from '../../hooks/useUpload';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

interface Props {
  uploadType:  'video' | 'pdf' | 'image' | 'avatar';
  accept?:     string;
  maxSizeMB?:  number;
  onUpload:    (result: UploadResult) => void;
  className?:  string;
  label?:      string;
  hint?:       string;
}

export default function UploadDropzone({
  uploadType, accept, maxSizeMB = 500, onUpload, className, label, hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, progress } = useUpload();
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState<UploadResult | null>(null);

  const handleFile = async (file: File) => {
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Max size: ${maxSizeMB}MB`);
      return;
    }
    try {
      const result = await upload(file, uploadType);
      setUploaded(result);
      onUpload(result);
      toast.success('File uploaded successfully');
    } catch {
      toast.error('Upload failed. Please try again.');
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const DEFAULT_ACCEPT: Record<string, string> = {
    video:  'video/mp4,video/webm,video/quicktime',
    pdf:    'application/pdf',
    image:  'image/jpeg,image/png,image/webp,image/gif',
    avatar: 'image/jpeg,image/png,image/webp',
  };

  if (uploaded) {
    return (
      <div className={cn('rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3', className)}>
        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-700 truncate">{uploaded.filename || 'File uploaded'}</p>
          <p className="text-xs text-green-600">Upload complete</p>
        </div>
        <button onClick={() => setUploaded(null)} className="text-green-400 hover:text-green-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all',
        dragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-400 hover:bg-gray-50',
        uploading && 'cursor-not-allowed opacity-75',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept || DEFAULT_ACCEPT[uploadType]}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        disabled={uploading}
      />

      {uploading ? (
        <>
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin mb-3" />
          <p className="text-sm font-medium text-brand-600">Uploading… {progress}%</p>
          <div className="w-full max-w-xs mt-3 h-1.5 rounded-full bg-gray-200">
            <div className="h-1.5 rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-700">{label || 'Click or drag to upload'}</p>
          <p className="text-xs text-gray-400 mt-1">
            {hint || `Max ${maxSizeMB}MB`}
          </p>
        </>
      )}
    </div>
  );
}
