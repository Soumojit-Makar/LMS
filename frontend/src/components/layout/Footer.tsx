import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import LOGO from '../../assets/logo.png';
export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-brand-700">
            <img src={LOGO} alt="Logo" className="h-16" />
          </Link>
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Digitalindian. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}