import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  PlusCircle, Trash2, Youtube, FileVideo, FileText,
  Globe, EyeOff, ChevronDown, ChevronUp, Eye, EyeOff as EyeOffIcon,
  GripVertical, Edit2, Check, X,
} from 'lucide-react';
import { moduleService } from '../../services/module.service';
import { lessonService } from '../../services/lesson.service';
import { courseService } from '../../services/course.service';
import { queryClient } from '../../lib/queryClient';
import AddLessonModal from '../../components/course/AddLessonModal';
import PageLoader from '../../components/common/PageLoader';
import EmptyState from '../../components/common/EmptyState';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface Lesson { _id: string; title: string; type: string; order: number; isFreePreview: boolean; isPublished: boolean; duration: number }
interface Module { _id: string; title: string; order: number; isPublished: boolean; lessons: Lesson[] }

const TYPE_ICON: Record<string, React.ElementType> = {
  youtube: Youtube,
  video:   FileVideo,
  pdf:     FileText,
  text:    FileText,
};

export default function CourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const {slug} = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addLessonModal, setAddLessonModal] = useState<{ moduleId: string; order: number } | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');

  // Fetch course curriculum
  const { data, isLoading } = useQuery({
    queryKey: ['course-curriculum', id],
    queryFn: async () => {
      const [courseRes, modulesRes] = await Promise.all([
        api.get(`/courses/${slug}`).then((res) =>{ return res}).catch(() => null),
        api.get(`/modules?course=${id}`).then((res) => { console.log(res.data.data); return res.data.data}).catch(() => null),
      ]);
      return { course: courseRes?.data?.data, modules: modulesRes || [] };
    },
    enabled: !!id,
  });

  const addModuleMutation = useMutation({
    mutationFn: (title: string) => moduleService.create({ course: id, title, order: 999 }),
    onSuccess: () => {
      toast.success('Section added');
      setNewModuleTitle('');
      queryClient.invalidateQueries({ queryKey: ['course-curriculum', id] });
    },
    onError: () => toast.error('Failed to add section'),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => moduleService.delete(moduleId),
    onSuccess: () => { toast.success('Section deleted'); queryClient.invalidateQueries({ queryKey: ['course-curriculum', id] }); },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => lessonService.delete(lessonId),
    onSuccess: () => { toast.success('Lesson deleted'); queryClient.invalidateQueries({ queryKey: ['course-curriculum', id] }); },
  });

  const toggleLessonPublished = useMutation({
    mutationFn: ({ lessonId, published }: { lessonId: string; published: boolean }) =>
      lessonService.update(lessonId, { isPublished: published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course-curriculum', id] }),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => courseService.updateStatus(id!, status),
    onSuccess: (_, status) => {
      toast.success(status === 'published' ? 'Course is now live!' : 'Course unpublished');
      queryClient.invalidateQueries({ queryKey: ['course-curriculum', id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Status update failed'),
  });

  const saveModuleTitle = async (moduleId: string) => {
    if (!editingModuleTitle.trim()) return;
    try {
      await moduleService.update(moduleId, { title: editingModuleTitle });
      setEditingModuleId(null);
      queryClient.invalidateQueries({ queryKey: ['course-curriculum', id] });
      toast.success('Section renamed');
    } catch { toast.error('Failed to rename'); }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const s = new Set(prev);
      s.has(moduleId) ? s.delete(moduleId) : s.add(moduleId);
      return s;
    });
  };

  if (isLoading) return <PageLoader />;

  const modules: Module[] = data?.modules || [];
  const course = data?.course || { title: '', status: 'draft' };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-gray-900 truncate">
            {course?.title || 'Edit Course'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={
              course?.status === 'published' ? 'badge-green' :
              course?.status === 'draft'     ? 'badge-yellow' : 'badge-gray'
            }>
              {course?.status || 'draft'}
            </span>
            <span className="text-xs text-gray-400">{modules.length} sections · {modules.reduce((a, m) => a + m.lessons.length, 0)} lessons</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {course?.status !== 'published' ? (
            <button onClick={() => statusMutation.mutate('published')} disabled={statusMutation.isPending}
              className="btn-primary gap-2 text-sm">
              <Globe className="h-4 w-4" /> Publish
            </button>
          ) : (
            <button onClick={() => statusMutation.mutate('draft')} disabled={statusMutation.isPending}
              className="btn-secondary gap-2 text-sm">
              <EyeOff className="h-4 w-4" /> Unpublish
            </button>
          )}
        </div>
      </div>

      {/* Add Module */}
      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          <input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="New section title e.g. Getting Started"
            className="input flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter' && newModuleTitle.trim()) addModuleMutation.mutate(newModuleTitle.trim()); }}
          />
          <button
            onClick={() => newModuleTitle.trim() && addModuleMutation.mutate(newModuleTitle.trim())}
            disabled={!newModuleTitle.trim() || addModuleMutation.isPending}
            className="btn-primary gap-2 shrink-0"
          >
            <PlusCircle className="h-4 w-4" /> Add Section
          </button>
        </div>
      </div>

      {/* Curriculum */}
      {modules.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No sections yet"
          description="Add your first section above, then add lessons inside it."
        />
      ) : (
        <div className="space-y-3">
          {modules.sort((a, b) => a.order - b.order).map((mod) => (
            <div key={mod._id} className="card overflow-hidden">
              {/* Module header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <GripVertical className="h-4 w-4 text-gray-300 shrink-0 cursor-grab" />

                {editingModuleId === mod._id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={editingModuleTitle}
                      onChange={(e) => setEditingModuleTitle(e.target.value)}
                      className="input py-1 text-sm flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveModuleTitle(mod._id);
                        if (e.key === 'Escape') setEditingModuleId(null);
                      }}
                    />
                    <button onClick={() => saveModuleTitle(mod._id)} className="p-1 text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingModuleId(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <button
                    className="flex-1 text-left font-medium text-gray-900 text-sm hover:text-brand-600 transition-colors"
                    onClick={() => toggleModule(mod._id)}
                  >
                    {mod.title}
                  </button>
                )}

                <span className="text-xs text-gray-400 shrink-0">{mod.lessons.length} lessons</span>

                {/* Module actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingModuleId(mod._id); setEditingModuleTitle(mod.title); }}
                    className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { if (confirm('Delete this section and all its lessons?')) deleteModuleMutation.mutate(mod._id); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => toggleModule(mod._id)} className="p-1.5 text-gray-400">
                    {expandedModules.has(mod._id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Lessons */}
              {expandedModules.has(mod._id) && (
                <div>
                  {mod.lessons.sort((a, b) => a.order - b.order).map((lesson) => {
                    const Icon = TYPE_ICON[lesson.type] || FileText;
                    return (
                      <div key={lesson._id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 group">
                        <GripVertical className="h-4 w-4 text-gray-200 group-hover:text-gray-300 cursor-grab shrink-0" />
                        <Icon className={`h-4 w-4 shrink-0 ${lesson.type === 'youtube' ? 'text-red-500' : 'text-gray-400'}`} />
                        <span className="flex-1 text-sm text-gray-700 truncate">{lesson.title}</span>

                        {lesson.type === 'youtube' && (
                          <span className="badge-red text-xs shrink-0 flex items-center gap-1">
                            <Youtube className="h-3 w-3" /> YouTube
                          </span>
                        )}
                        {lesson.isFreePreview && (
                          <span className="badge-green text-xs shrink-0">Preview</span>
                        )}
                        <span className={lesson.isPublished ? 'badge-green' : 'badge-gray'}>
                          {lesson.isPublished ? 'Live' : 'Draft'}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleLessonPublished.mutate({ lessonId: lesson._id, published: !lesson.isPublished })}
                            className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50"
                            title={lesson.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {lesson.isPublished ? <EyeOffIcon className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => { if (confirm('Delete this lesson?')) deleteLessonMutation.mutate(lesson._id); }}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add lesson button */}
                  <button
                    onClick={() => setAddLessonModal({ moduleId: mod._id, order: mod.lessons.length + 1 })}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-brand-600 hover:bg-brand-50 transition-colors font-medium"
                  >
                    <PlusCircle className="h-4 w-4" /> Add Lesson
                  </button>
                </div>
              )}

              {/* Collapsed: quick add lesson */}
              {!expandedModules.has(mod._id) && (
                <button
                  onClick={() => { setExpandedModules((p) => { const s = new Set(p); s.add(mod._id); return s; }); setAddLessonModal({ moduleId: mod._id, order: mod.lessons.length + 1 }); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Add lesson to this section
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Lesson Modal */}
      {addLessonModal && id && (
        <AddLessonModal
          courseId={id}
          moduleId={addLessonModal.moduleId}
          order={addLessonModal.order}
          onClose={() => setAddLessonModal(null)}
        />
      )}
    </div>
  );
}