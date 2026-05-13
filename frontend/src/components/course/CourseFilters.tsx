import { Search } from 'lucide-react';

interface Category { _id: string; name: string; slug: string }

interface Props {
  search:        string;
  category:      string;
  level:         string;
  isFree:        string;
  sort:          string;
  categories:    Category[];
  onSearch:      (v: string) => void;
  onCategory:    (v: string) => void;
  onLevel:       (v: string) => void;
  onFree:        (v: string) => void;
  onSort:        (v: string) => void;
}

export default function CourseFilters({
  search, category, level, isFree, sort, categories,
  onSearch, onCategory, onLevel, onFree, onSort,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search courses…"
          className="input pl-10"
        />
      </div>
      <select value={category} onChange={(e) => onCategory(e.target.value)} className="input w-auto">
        <option value="">All Categories</option>
        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <select value={level} onChange={(e) => onLevel(e.target.value)} className="input w-auto">
        <option value="">All Levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <select value={isFree} onChange={(e) => onFree(e.target.value)} className="input w-auto">
        <option value="">Any Price</option>
        <option value="true">Free</option>
        <option value="false">Paid</option>
      </select>
      <select value={sort} onChange={(e) => onSort(e.target.value)} className="input w-auto">
        <option value="newest">Newest</option>
        <option value="popular">Most Popular</option>
        <option value="ratingAverage">Highest Rated</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
      </select>
    </div>
  );
}
