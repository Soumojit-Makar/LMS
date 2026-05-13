import { NavLink } from 'react-router-dom';
import { Tag, CreditCard, BookOpen, UserCheck, Users, LayoutDashboard } from 'lucide-react';

export default function AdminSidebar() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-100 bg-white p-4 min-h-[calc(100vh-64px)]">
      <nav className="flex flex-col gap-1">
            <NavLink to="/admin" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><LayoutDashboard className="h-4 w-4 shrink-0" />Overview</NavLink>
            <NavLink to="/admin/users" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><Users className="h-4 w-4 shrink-0" />Users</NavLink>
            <NavLink to="/admin/courses" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><BookOpen className="h-4 w-4 shrink-0" />Courses</NavLink>
            <NavLink to="/admin/categories" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><Tag className="h-4 w-4 shrink-0" />Categories</NavLink>
            <NavLink to="/admin/trainers" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><UserCheck className="h-4 w-4 shrink-0" />Trainers</NavLink>
            <NavLink to="/admin/payments" end className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><CreditCard className="h-4 w-4 shrink-0" />Payments</NavLink>
      </nav>
    </aside>
  );
}