import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function RoleRoute({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}