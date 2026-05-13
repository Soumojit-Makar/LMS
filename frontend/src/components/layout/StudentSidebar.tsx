import { NavLink } from 'react-router-dom';
import { BookOpen, GraduationCap, LayoutDashboard } from 'lucide-react';

export default function StudentSidebar() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-100 bg-white p-4 min-h-[calc(100vh-64px)]">
      <nav className="flex flex-col gap-1">
            <NavLink to="/dashboard" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><LayoutDashboard className="h-4 w-4 shrink-0" />Dashboard</NavLink>
            <NavLink to="/courses" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><BookOpen className="h-4 w-4 shrink-0" />Browse Courses</NavLink>
            <NavLink to="/profile" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><GraduationCap className="h-4 w-4 shrink-0" />Profile</NavLink>
      </nav>
    </aside>
  );
}