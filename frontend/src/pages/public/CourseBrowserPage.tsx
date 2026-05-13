import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { courseService } from '../../services/course.service';
import { categoryService } from '../../services/category.service';
import CourseCard from '../../components/course/CourseCard';
import Pagination from '../../components/common/Pagination';
import PageLoader from '../../components/common/PageLoader';
import EmptyState from '../../components/common/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { Course } from '../../components/course/CourseCard';
type Category = {
  _id: string;
  name: string;
};



type CourseListResponse = {
  data: {
    data: {
      data: Course[];
      total: number;
      totalPages: number;
    };
  };
};

export default function CourseBrowserPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [isFree, setIsFree] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const dq = useDebounce(search, 400);

  const { data: cats = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryService.list as () => Promise<Category[]>,
  });

  const { data, isLoading } = useQuery<CourseListResponse>({
    queryKey: ['courses', dq, category, level, isFree, sort, page],
    queryFn: () =>
      courseService.list({
        q: dq,
        category,
        level,
        isFree: isFree || undefined,
        sort,
        page,
        limit: 12,
      }) as Promise<CourseListResponse>,
    placeholderData: (previousData) => previousData,
  });

  const courses = data?.data?.data?.data || [];
  const total = data?.data?.data?.totalPages || 1;
  const totalCourses = data?.data?.data?.total || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
        All Courses
      </h1>

      <p className="text-gray-500 mb-8">
        Explore our full catalogue of expert-led courses
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search courses…"
            className="input pl-10"
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="input w-auto"
        >
          <option value="">All categories</option>
          {cats.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(1);
          }}
          className="input w-auto"
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          value={isFree}
          onChange={(e) => {
            setIsFree(e.target.value);
            setPage(1);
          }}
          className="input w-auto"
        >
          <option value="">Any price</option>
          <option value="true">Free</option>
          <option value="false">Paid</option>
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="input w-auto"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most popular</option>
          <option value="ratingAverage">Highest rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No courses found"
          description="Try adjusting your filters or search term."
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {totalCourses} courses found
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((c: Course) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>

          <Pagination page={page} totalPages={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}