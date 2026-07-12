import { useState } from 'react';
import { useForm as useRHF } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const Login = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useRHF<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setError('');
      const res = await apiClient.post('/auth/login', data);
      login(res.data.data.accessToken, res.data.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative"
      style={{ background: 'linear-gradient(135deg, #fdf6ec 0%, #fde8cc 30%, #fcd5a0 60%, #f5c07a 100%)' }}>
      {/* Soft autumn glow overlay */}
      <div className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse at 30% 40%, #fbbf2422 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, #fb923c22 0%, transparent 55%)' }} />

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl animate-fade-in shadow-xl border border-amber-200/60"
        style={{ background: 'rgba(255, 252, 245, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 border border-amber-400/50 bg-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-800">AssetFlow</h1>
          <p className="text-stone-500 mt-2 text-sm">Enterprise Resource Management</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm text-center">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-700 font-medium">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="bg-white border-amber-200 text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-300/40"
              {...register('email')}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-stone-700 font-medium">Password</Label>
              <a href="#" className="text-xs text-amber-600 hover:text-amber-700 transition-colors">Forgot password?</a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-white border-amber-200 text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-300/40"
              {...register('password')}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-medium text-lg rounded-xl transition-all shadow-[0_0_24px_rgba(217,119,6,0.5)] bg-amber-600 hover:bg-amber-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-stone-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-amber-600 font-medium hover:text-amber-700 hover:underline transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
