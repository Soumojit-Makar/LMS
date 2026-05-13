import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-8xl font-display font-bold text-gray-100 mb-4">404</p>
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn-primary gap-2">
          <Home className="h-4 w-4" /> Go Home
        </Link>
        <Link to="/courses" className="btn-secondary gap-2">
          <Search className="h-4 w-4" /> Browse Courses
        </Link>
      </div>
    </div>
  );
}
