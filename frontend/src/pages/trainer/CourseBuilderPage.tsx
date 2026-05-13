import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Upload, Loader2 } from 'lucide-react';
import { courseService } from '../../services/course.service';
import { categoryService } from '../../services/category.service';
import { useUpload } from '../../hooks/useUpload';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  shortDescription: z.string().max(300).optional(),
  category: z.string().min(1, 'Select a category'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().default('English'),
  isFree: z.boolean().default(false),
  price: z.number().min(0).optional(),
});

type Form = z.infer<typeof schema>;

export default function CourseBuilderPage() {
  const navigate = useNavigate();
  const { upload, uploading, progress } = useUpload();
  const [thumbnail, setThumbnail] = useState<{ publicId: string; url: string } | null>(null);

  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: categoryService.list });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { level: 'beginner', language: 'English', isFree: false },
  });

  const isFree = watch('isFree');

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    try {
      const result = await upload(file, 'image');
      setThumbnail({ publicId: result.publicId, url: result.url });
      toast.success('Thumbnail uploaded');
    } catch { toast.error('Thumbnail upload failed'); }
  };

  const onSubmit = async (data: Form) => {
    if (!thumbnail) { toast.error('Please upload a course thumbnail'); return; }
    try {
      const payload = {
        ...data,
        thumbnail,
        pricing: { isFree: data.isFree, price: data.isFree ? 0 : (data.price || 0), currency: 'INR' },
      };
      const res = await courseService.create(payload);
      toast.success('Course created! Now add modules and lessons.');
      navigate(`/trainer/courses/${res.data.data._id}/edit`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create course');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Create New Course</h1>
      <p className="text-gray-500 mb-8">Fill in the details to create your course draft</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="label">Course Title *</label>
            <input {...register('title')} className="input" placeholder="e.g. Complete React Development Bootcamp" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Short Description</label>
            <input {...register('shortDescription')} className="input" placeholder="One-line summary (max 300 chars)" />
          </div>
          <div>
            <label className="label">Full Description *</label>
            <textarea {...register('description')} rows={5} className="input resize-none" placeholder="Detailed course description…" />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Category *</label>
              <select {...register('category')} className="input">
                <option value="">Select…</option>
                {cats?.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label">Level</label>
              <select {...register('level')} className="input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="label">Language</label>
              <input {...register('language')} className="input" defaultValue="English" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing</h2>
          <div className="flex items-center gap-3">
            <input type="checkbox" {...register('isFree')} id="isFree" className="h-4 w-4 rounded border-gray-300 text-brand-600" />
            <label htmlFor="isFree" className="text-sm font-medium text-gray-700">This is a free course</label>
          </div>
          {!isFree && (
            <div>
              <label className="label">Price (₹)</label>
              <input {...register('price', { valueAsNumber: true })} type="number" min="0" step="1" className="input" placeholder="1999" />
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Thumbnail *</h2>
          {thumbnail ? (
            <div className="relative w-48">
              <img src={thumbnail.url} alt="Thumbnail" className="w-full aspect-video rounded-xl object-cover" />
              <button type="button" onClick={() => setThumbnail(null)} className="absolute top-2 right-2 bg-white rounded-lg px-2 py-1 text-xs text-red-500 shadow">Remove</button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-brand-400 transition-colors">
              {uploading ? (
                <><Loader2 className="h-8 w-8 text-brand-500 animate-spin mb-2" /><span className="text-sm text-gray-500">{progress}%</span></>
              ) : (
                <><Upload className="h-8 w-8 text-gray-300 mb-2" /><span className="text-sm text-gray-500">Click to upload thumbnail</span><span className="text-xs text-gray-400 mt-1">JPG, PNG — recommended 1280×720</span></>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploading} />
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/trainer')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting || uploading} className="btn-primary px-8">
            {isSubmitting ? 'Creating…' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
}