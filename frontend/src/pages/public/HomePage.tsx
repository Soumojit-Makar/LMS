import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../../services/course.service';
import CourseCard from '../../components/course/CourseCard';
import PageLoader from '../../components/common/PageLoader';

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['courses-featured'],
    queryFn: () => courseService.list({ limit: 8, sort: 'popular' })
      .then((res) => {    return res; })
      .catch(() => ({ data: { data: { courses: [] } } })),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 py-24 px-4">
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 mb-6">
            <Zap className="h-4 w-4 text-accent" /> India's premier skill learning platform
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Build skills that <span className="text-accent">get you hired</span>
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Learn from expert trainers with hands-on courses in tech, design, business and more. Start free today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow-lg hover:bg-gray-50 transition-colors">
              Explore Courses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['10,000+', 'Students enrolled'], ['500+', 'Expert trainers'], ['1,200+', 'Courses available'], ['95%', 'Completion rate']].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-3xl font-bold text-brand-700">{v}</p>
              <p className="mt-1 text-sm text-gray-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">Featured Courses</h2>
              <p className="text-sm text-gray-500 mt-1">Handpicked by our editorial team</p>
            </div>
            <Link to="/courses" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? <PageLoader /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.data.data.data?.map((c: any) => <CourseCard key={c._id} course={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-12">Why Digitalindian?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              [BookOpen, 'Expert-curated content', 'Courses built by industry professionals with real-world experience.'],
              [Users, 'Learn at your pace', 'Lifetime access, mobile-friendly player, and offline certificate downloads.'],
              [Award, 'Verified certificates', 'Get recognised certificates after completing courses and quizzes.'],
            ].map(([Icon, title, desc]) => (
              <div key={title as string} className="card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
                  <Icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{title as string}</h3>
                <p className="text-sm text-gray-500">{desc as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}