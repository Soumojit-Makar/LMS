import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { useState } from 'react';
import { courseService } from '../../services/course.service';
import { enrollmentService } from '../../services/enrollment.service';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency, formatDate, formatDuration } from '../../utils/format';
import { useCheckout } from '../../features/payments/useCheckout';
import PageLoader from '../../components/common/PageLoader';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { initiate, loading: checkoutLoading } = useCheckout();

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const {
    data: course,
    isLoading: isCourseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const res = await courseService.get(slug!);

      // console.log('✅ Course API Full Response:', res);
      // console.log('✅ Course Data:', res.data?.data);

      return res.data?.data;
    },
    enabled: !!slug,
  });

  const courseId = course?._id;

  const {
    data: modules = [],
    isLoading: isModulesLoading,
    error: modulesError,
  } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      // console.log('📡 Calling Modules API with Course ID:', courseId);

      const res = await api.get(`/modules?course=${courseId}`);

      // console.log('✅ Modules API Full Response:', res);
      // console.log('✅ Modules Data:', res.data?.data);

      return res.data?.data || [];
    },
    enabled: !!courseId,
  });

  const handleEnroll = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    if (!course) {
      toast.error('Course data not loaded');
      return;
    }

    if (course.pricing?.isFree) {
      try {
        await enrollmentService.enroll(course._id);

        toast.success('Enrolled! Starting your learning journey…');

        const firstLessonId =
          modules?.[0]?.lessons?.[0]?._id ||
          course.curriculum?.[0]?.lessons?.[0]?._id;

        if (!firstLessonId) {
          toast.error('No lesson found in this course');
          navigate('/dashboard');
          return;
        }

        navigate(`/learn/${course._id}/lessons/${firstLessonId}`);
      } catch (err: any) {
        console.error('❌ Enrollment Error:', err);

        if (err?.response?.status === 409) {
          navigate('/dashboard');
          return;
        }

        toast.error(err?.response?.data?.message || 'Enrollment failed');
      }
    } else {
      await initiate(course._id);
    }
  };

  if (isCourseLoading) return <PageLoader />;

  if (courseError) {
    console.error('❌ Course Error:', courseError);
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load course.
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-gray-500">
        Course not found.
      </div>
    );
  }

  if (modulesError) {
    console.error('❌ Modules Error:', modulesError);
  }

  const displayModules = modules?.length > 0 ? modules : course.curriculum || [];

  const totalLessons =
    course.totalLessons ||
    displayModules?.reduce(
      (sum: number, mod: any) => sum + (mod.lessons?.length || 0),
      0
    ) ||
    0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="mb-2">
            <span className="badge-blue capitalize">{course.level}</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">
            {course.title}
          </h1>

          <p className="text-gray-600 mb-4">{course.shortDescription}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <strong className="text-gray-700">
                {course.ratingAverage?.toFixed?.(1) || '0.0'}
              </strong>
              ({course.ratingCount || 0} reviews)
            </span>

            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.enrollmentCount || 0} students
            </span>

            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(course.totalDuration || 0)}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            By{' '}
            <strong className="text-gray-700">
              {course.trainer?.name || 'Instructor'}
            </strong>{' '}
            · Last updated {formatDate(course.updatedAt)}
          </p>

          {/* Outcomes */}
          {course.outcomes?.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="font-display font-semibold text-gray-900 mb-4">
                What you'll learn
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.outcomes.map((outcome: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {outcome}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum */}
          <div>
            <h2 className="font-display font-semibold text-gray-900 mb-4">
              Course curriculum
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              {displayModules.length || 0} sections · {totalLessons} lessons ·{' '}
              {formatDuration(course.totalDuration || 0)} total
            </p>

            {isModulesLoading && (
              <div className="text-sm text-gray-500 mb-4">
                Loading modules...
              </div>
            )}

            <div className="space-y-2">
              {displayModules?.length > 0 ? (
                displayModules.map((mod: any) => (
                  <div
                    key={mod._id}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedModules((prev) => {
                          const selected = new Set(prev);

                          if (selected.has(mod._id)) {
                            selected.delete(mod._id);
                          } else {
                            selected.add(mod._id);
                          }

                          return selected;
                        })
                      }
                      className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="font-medium text-gray-900 text-sm">
                        {mod.title}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {mod.lessons?.length || 0} lessons
                        </span>

                        {expandedModules.has(mod._id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedModules.has(mod._id) && (
                      <div className="divide-y divide-gray-50">
                        {mod.lessons?.length > 0 ? (
                          mod.lessons.map((lesson: any) => (
                            <div
                              key={lesson._id}
                              className="flex items-center gap-3 px-4 py-3"
                            >
                              {lesson.type === 'video' ? (
                                <Play className="h-4 w-4 text-gray-400 shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                              )}

                              <span className="text-sm text-gray-700 flex-1">
                                {lesson.title}
                              </span>

                              {lesson.isFreePreview ? (
                                <Link
                                  to={`/learn/${course._id}/lessons/${lesson._id}`}
                                  className="badge-green text-xs cursor-pointer"
                                >
                                  Preview
                                </Link>
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-gray-300" />
                              )}

                              {lesson.duration > 0 && (
                                <span className="text-xs text-gray-400">
                                  {formatDuration(lesson.duration)}
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-400">
                            No lessons added yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">
                  No curriculum available yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Purchase card */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-6">
              <img
                src={
                  course.thumbnail?.url ||
                  'https://placehold.co/400x225/e5e7eb/9ca3af?text=Course'
                }
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mb-4">
              {course.pricing?.isFree ? (
                <p className="text-3xl font-display font-bold text-green-600">
                  Free
                </p>
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-display font-bold text-gray-900">
                    {formatCurrency(
                      course.pricing?.discountPrice ?? course.pricing?.price ?? 0
                    )}
                  </p>

                  {course.pricing?.discountPrice && (
                    <p className="text-lg text-gray-400 line-through">
                      {formatCurrency(course.pricing?.price ?? 0)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleEnroll}
              disabled={checkoutLoading}
              className="btn-primary w-full py-3 text-base mb-4"
            >
              {checkoutLoading
                ? 'Processing…'
                : course.pricing?.isFree
                ? 'Enroll for free'
                : 'Buy now'}
            </button>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                {formatDuration(course.totalDuration || 0)} of content
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                {course.enrollmentCount || 0} students enrolled
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-gray-400" />
                Certificate on completion
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}