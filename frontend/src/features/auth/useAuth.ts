import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, setAuth, clearAuth, accessToken } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { user: u } = res.data.data;
    const { accessToken: token } = res.data.tokens;
    setAuth(u, token);
    return u;
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    clearAuth();
    navigate('/');
    toast.success('Logged out');
  };

  const isStudent = user?.role === 'student';
  const isTrainer = user?.role === 'trainer';
  const isAdmin   = user?.role === 'admin';

  return { user, accessToken, login, logout, isStudent, isTrainer, isAdmin };
}
