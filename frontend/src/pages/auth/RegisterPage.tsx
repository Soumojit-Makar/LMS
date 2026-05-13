import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['student', 'trainer']),
});
type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: { role: 'student' },
  });

  const onSubmit = async (data: Form) => {
    try {
      const res = await authService.register(data);
      const { user } = res.data.data;
      const { accessToken } = res.data.tokens;
      setAuth(user, accessToken);
      if (user.role === 'trainer') {
        toast.success('Account created! Your trainer account is pending admin approval.');
        navigate('/');
      } else {
        navigate('/dashboard');
        toast.success('Welcome to Digitalindian!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-white">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 font-display font-bold text-brand-700 text-xl">
              <BookOpen className="h-7 w-7" /> Digitalindian
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 text-center mb-1">Create an account</h1>
          <p className="text-sm text-gray-500 text-center mb-8">Start your learning journey today</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input {...register('name')} className="input" placeholder="Rahul Sharma" autoFocus />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">I want to</label>
              <select {...register('role')} className="input">
                <option value="student">Learn — I'm a student</option>
                <option value="trainer">Teach — I'm a trainer</option>
              </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-2">
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}