import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Youtube, Upload, FileText, Type } from 'lucide-react';
import { lessonService } from '../../services/lesson.service';
import YouTubeUrlInput from '../media/YouTubeUrlInput';
import { queryClient } from '../../lib/queryClient';
import toast from 'react-hot-toast';

type LessonKind = 'youtube' | 'video' | 'pdf' | 'text';

interface Props {
  courseId: string;
  moduleId: string;
  order: number;
  onClose: () => void;
}

const schema = z.object({
  title:      z.string().min(2, 'Title is required'),
  kind:       z.enum(['youtube', 'video', 'pdf', 'text']),
  youtubeUrl: z.string().optional(),
  isFreePreview: z.boolean().optional(),
}).superRefine((d, ctx) => {
  if (d.kind === 'youtube' && !d.youtubeUrl?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['youtubeUrl'], message: 'Paste a YouTube URL' });
  }
  if (d.kind === 'youtube' && d.youtubeUrl) {
    const patterns = [/youtu\.be\/([A-Za-z0-9_-]{11})/, /[?&]v=([A-Za-z0-9_-]{11})/, /embed\/([A-Za-z0-9_-]{11})/, /shorts\/([A-Za-z0-9_-]{11})/, /^([A-Za-z0-9_-]{11})$/];
    const ok = patterns.some((re) => re.test(d.youtubeUrl!));
    if (!ok) ctx.addIssue({ code: 'custom', path: ['youtubeUrl'], message: 'Invalid YouTube URL' });
  }
});

type Form = z.infer<typeof schema>;

const KIND_OPTIONS: { value: LessonKind; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'youtube', label: 'YouTube Video', icon: Youtube,   desc: 'Paste a YouTube URL — students cannot see it' },
  { value: 'video',   label: 'Upload Video',  icon: Upload,    desc: 'Upload directly to cloud storage' },
  { value: 'pdf',     label: 'PDF / File',    icon: FileText,  desc: 'Upload a PDF or document' },
  { value: 'text',    label: 'Text / Article',icon: Type,      desc: 'Write text content directly' },
];

export default function AddLessonModal({ courseId, moduleId, order, onClose }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { kind: 'youtube', isFreePreview: false },
  });

  const kind = watch('kind');
  const ytUrl = watch('youtubeUrl') || '';

  const onSubmit = async (data: Form) => {
    try {
      const payload: any = {
        course:        courseId,
        module:        moduleId,
        title:         data.title,
        order,
        isFreePreview: data.isFreePreview || false,
      };

      if (data.kind === 'youtube') {
        payload.youtubeUrl = data.youtubeUrl;
      } else {
        payload.type = data.kind;
      }

      await lessonService.create(payload);
      toast.success('Lesson added!');
      queryClient.invalidateQueries({ queryKey: ['course-curriculum', courseId] });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add lesson');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900 text-lg">Add Lesson</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="label">Lesson Title *</label>
            <input {...register('title')} className="input" placeholder="e.g. Introduction to React Hooks" autoFocus />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Lesson kind picker */}
          <div>
            <label className="label">Content Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {KIND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('kind', opt.value)}
                  className={[
                    'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                    kind === opt.value
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <opt.icon className={`h-5 w-5 mt-0.5 shrink-0 ${kind === opt.value ? 'text-brand-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-medium ${kind === opt.value ? 'text-brand-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* YouTube URL input */}
          {kind === 'youtube' && (
            <YouTubeUrlInput
              value={ytUrl}
              onChange={(url) => setValue('youtubeUrl', url)}
              error={errors.youtubeUrl?.message}
            />
          )}

          {/* Cloudinary video / PDF info */}
          {(kind === 'video' || kind === 'pdf') && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Upload file after saving</p>
              <p className="text-xs text-blue-600">
                After creating this lesson, use the <strong>Upload Media</strong> button on the lesson
                to upload the file directly to cloud storage.
              </p>
            </div>
          )}

          {/* Text content placeholder */}
          {kind === 'text' && (
            <div>
              <label className="label">Content (optional — edit after creation)</label>
              <textarea rows={4} className="input resize-none text-sm" placeholder="Enter lesson text or article content…" />
            </div>
          )}

          {/* Free preview toggle */}
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="isFreePreview"
              {...register('isFreePreview')}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isFreePreview" className="text-sm font-medium text-gray-700">
              Free preview — allow non-enrolled users to watch
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Adding…' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}