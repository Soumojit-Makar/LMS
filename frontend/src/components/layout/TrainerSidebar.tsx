import { NavLink } from 'react-router-dom';
import { User, PlusCircle, BarChart2, LayoutDashboard } from 'lucide-react';

export default function TrainerSidebar() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-100 bg-white p-4 min-h-[calc(100vh-64px)]">
      <nav className="flex flex-col gap-1">
            <NavLink to="/trainer" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><LayoutDashboard className="h-4 w-4 shrink-0" />Dashboard</NavLink>
            <NavLink to="/trainer/courses/new" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><PlusCircle className="h-4 w-4 shrink-0" />New Course</NavLink>
            <NavLink to="/trainer/analytics" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><BarChart2 className="h-4 w-4 shrink-0" />Analytics</NavLink>
            <NavLink to="/profile" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><User className="h-4 w-4 shrink-0" />Profile</NavLink>
      </nav>
    </aside>
  );
}