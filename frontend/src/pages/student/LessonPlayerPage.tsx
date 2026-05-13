import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Menu,
  X,
  CheckCircle,
  Circle,
  Youtube,
  FileVideo,
  FileText,
  Type,
  Star,
} from 'lucide-react';
import { progressService } from '../../services/progress.service';
import VideoPlayer from '../../components/media/VideoPlayer';
import { queryClient } from '../../lib/queryClient';
import { formatDuration } from '../../utils/format';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const TYPE_ICON: Record<string, React.ElementType> = {
  youtube: Youtube,
  video: FileVideo,
  pdf: FileText,
  text: Type,
};

interface LessonItem {
  _id: string;
  title: string;
  type: string;
  isFreePreview: boolean;
  isPublished: boolean;
  duration: number;
  order: number;
}

interface ModuleItem {
  _id: string;
  title: string;
  order: number;
  lessons: LessonItem[];
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);

  const [lessonType, setLessonType] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  const { data: modules = [] } = useQuery({
    queryKey: ['player-modules', courseId],
    queryFn: async () => {
      const res = await api.get(`/modules?course=${courseId}`);
      console.log('✅ Player Modules:', res.data?.data);
      return res.data?.data || [];
    },
    enabled: !!courseId,
  });

  const { data: progressData } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: async () => {
      const res = await progressService.getCourseProgress(courseId!);
      console.log('✅ Progress:', res.data?.data);
      return res.data?.data;
    },
    enabled: !!courseId,
  });

  const completedLessons: string[] = progressData?.completedLessons || [];
  const progressPct: number = progressData?.progressPercent || 0;

  useEffect(() => {
    if (!lessonId || lessonId === 'first') return;

    setLessonType(null);
    setVideoUrl(null);
    setPdfUrl(null);
    setTextContent(null);

    api
      .get(`/lessons/${lessonId}/stream-url`)
      .then((res) => {
        const data = res.data?.data || res.data;

        console.log('✅ Lesson Stream:', data);

        setLessonType(data.type);

        if (data.type === 'pdf') {
          setPdfUrl(data.url);
        }

        if (data.type === 'text') {
          setTextContent(data.content || '');
        }

        if (data.type === 'video') {
          setVideoUrl(data.url);
        }
        if (data.type === 'youtube') {
          setVideoUrl(`${API_BASE_URL}/lessons/${lessonId}/playback-frame?token=${data.playbackToken}`);
        }
      })
      .catch((err) => {
        console.error('❌ Lesson stream error:', err);
        toast.error('Could not load lesson content');
      });
  }, [lessonId]);

  useEffect(() => {
    if (!modules?.length || !lessonId) return;

    for (const mod of modules) {
      const found = mod.lessons?.find((lesson: LessonItem) => lesson._id === lessonId);

      if (found) {
        setActiveLesson(found);
        return;
      }
    }

    setActiveLesson(null);
  }, [modules, lessonId]);

  const completeMutation = useMutation({
    mutationFn: () => progressService.complete(lessonId!),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });

      const pct = res.data?.data?.progressPercent;

      if (pct === 100) {
        toast.success('🎉 Course complete! You can now download your certificate.');
      } else {
        toast.success('Lesson marked complete');
      }
    },
    onError: (err) => {
      console.error('❌ Complete lesson error:', err);
      toast.error('Could not mark lesson complete');
    },
  });

  const isCompleted = completedLessons.includes(lessonId || '');

  const goToNext = () => {
    const allLessons: LessonItem[] = modules
      .sort((a: ModuleItem, b: ModuleItem) => a.order - b.order)
      .flatMap((mod: ModuleItem) =>
        [...(mod.lessons || [])].sort((a, b) => a.order - b.order)
      );

    const index = allLessons.findIndex((lesson) => lesson._id === lessonId);

    if (index >= 0 && index < allLessons.length - 1) {
      navigate(`/learn/${courseId}/lessons/${allLessons[index + 1]._id}`);
    } else {
      toast.success('You reached the last lesson');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-950 overflow-hidden">
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 overflow-hidden bg-white border-r border-gray-100 flex flex-col shrink-0`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="font-semibold text-sm text-gray-900 truncate flex-1 mr-2">
            Course Content
          </span>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-2.5 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Your progress</span>
            <span className="font-semibold">{progressPct}%</span>
          </div>

          <div className="h-1.5 rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-brand-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {[...modules]
            .sort((a: ModuleItem, b: ModuleItem) => a.order - b.order)
            .map((mod: ModuleItem) => (
              <div key={mod._id}>
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                    {mod.title}
                  </p>
                </div>

                {[...(mod.lessons || [])]
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => {
                    const Icon = TYPE_ICON[lesson.type] || FileText;
                    const done = completedLessons.includes(lesson._id);
                    const active = lesson._id === lessonId;

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => navigate(`/learn/${courseId}/lessons/${lesson._id}`)}
                        className={`flex items-center gap-2.5 w-full px-4 py-3 text-left border-b border-gray-50 transition-colors ${
                          active
                            ? 'bg-brand-50 border-l-2 border-l-brand-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {done ? (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <Circle
                            className={`h-4 w-4 shrink-0 ${
                              active ? 'text-brand-500' : 'text-gray-300'
                            }`}
                          />
                        )}

                        <Icon
                          className={`h-3.5 w-3.5 shrink-0 ${
                            lesson.type === 'youtube' ? 'text-red-400' : 'text-gray-400'
                          }`}
                        />

                        <span
                          className={`text-xs flex-1 truncate ${
                            active
                              ? 'font-semibold text-brand-700'
                              : done
                              ? 'text-gray-500'
                              : 'text-gray-700'
                          }`}
                        >
                          {lesson.title}
                        </span>

                        {lesson.duration > 0 && (
                          <span className="text-xs text-gray-400 shrink-0">
                            {formatDuration(lesson.duration)}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link to="/dashboard" className="text-gray-400 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <span className="text-sm text-gray-300 flex-1 truncate">
            {activeLesson?.title || 'Select a lesson'}
          </span>

          <button
            onClick={() => !isCompleted && completeMutation.mutate()}
            disabled={isCompleted || completeMutation.isPending || !lessonId}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              isCompleted
                ? 'bg-green-600/20 text-green-400 cursor-default'
                : 'bg-brand-600 text-white hover:bg-brand-500 active:scale-95'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-3.5 w-3.5" />
                Mark complete
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-950 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {!lessonId || lessonId === 'first' ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Star className="h-12 w-12 text-gray-700 mb-4" />
                <p className="text-gray-500">Select a lesson from the sidebar to begin</p>
              </div>
            ) : pdfUrl ? (
              <div className="rounded-xl overflow-hidden bg-white">
                <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                  <FileText className="h-5 w-5 text-brand-600" />
                  <span className="font-medium text-sm text-gray-900">
                    PDF Document
                  </span>

                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto btn-secondary text-xs py-1.5 px-3"
                  >
                    Download
                  </a>
                </div>

                <iframe src={pdfUrl} className="w-full h-[640px]" title="PDF Lesson" />
              </div>
            ) : textContent !== null ? (
              <div className="card bg-white p-8">
                <div
                  className="prose max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html:
                      textContent || '<p class="text-gray-400">No content yet.</p>',
                  }}
                />
              </div>
            ) : videoUrl ? (
              lessonType === 'youtube' ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    title={activeLesson?.title || 'YouTube lesson'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-xl bg-black"
                  onEnded={() => {
                    if (!isCompleted) completeMutation.mutate();
                    setTimeout(goToNext, 1200);
                  }}
                />
              )
            ) : (
              <VideoPlayer
                lessonId={lessonId}
                onEnded={() => {
                  if (!isCompleted) completeMutation.mutate();
                  setTimeout(goToNext, 1200);
                }}
              />
            )}

            {activeLesson && (
              <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-display font-bold text-white">
                    {activeLesson.title}
                  </h1>

                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    {activeLesson.type === 'youtube' && (
                      <>
                        <Youtube className="h-4 w-4 text-red-400" />
                        YouTube Video
                      </>
                    )}

                    {activeLesson.type === 'video' && (
                      <>
                        <FileVideo className="h-4 w-4 text-blue-400" />
                        Video Lesson
                      </>
                    )}

                    {activeLesson.type === 'pdf' && (
                      <>
                        <FileText className="h-4 w-4 text-amber-400" />
                        PDF Document
                      </>
                    )}

                    {activeLesson.type === 'text' && (
                      <>
                        <Type className="h-4 w-4 text-green-400" />
                        Reading
                      </>
                    )}

                    {activeLesson.duration > 0 && (
                      <span>· {formatDuration(activeLesson.duration)}</span>
                    )}
                  </p>
                </div>

                <button onClick={goToNext} className="btn-secondary text-sm shrink-0">
                  Next Lesson →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}