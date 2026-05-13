import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';
export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    clearAuth();
    navigate('/');
    toast.success('Logged out');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'trainer' ? '/trainer' : '/dashboard';

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" >
        <div className="flex h-16 items-center justify-between py-8">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-brand-700 text-lg">
            <img src={logo} alt="Logo" className="h-16" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/courses" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Courses</Link>
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Log in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get started</Link>
              </>
            ) : (
              <div className="relative">
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-brand-700">{user.name[0]}</span>
                    </div>
                  )}
                  <span className="hidden sm:block font-medium text-gray-700 max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl z-50">
                    <Link to={dashboardPath} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="h-4 w-4 text-gray-400" />Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="h-4 w-4 text-gray-400" />Profile
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" />Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}