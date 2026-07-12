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
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      {/* Warm amber overlay */}
      <div className="absolute inset-0 bg-amber-950/55 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl animate-fade-in shadow-2xl border border-amber-300/30"
        style={{ background: 'rgba(255, 248, 235, 0.15)', backdropFilter: 'blur(18px)' }}>
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 border border-amber-400/60"
            style={{ background: 'rgba(251, 191, 36, 0.2)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-50">AssetFlow</h1>
          <p className="text-amber-200/80 mt-2 text-sm">Enterprise Resource Management</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && <div className="p-3 rounded-lg bg-red-900/30 border border-red-400/40 text-red-200 text-sm text-center">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-amber-100/90">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="bg-amber-50/10 border-amber-300/30 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-400 focus:ring-amber-400/30"
              {...register('email')}
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-amber-100/90">Password</Label>
              <a href="#" className="text-xs text-amber-300 hover:text-amber-200 transition-colors">Forgot password?</a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-amber-50/10 border-amber-300/30 text-amber-50 placeholder:text-amber-200/40 focus:border-amber-400 focus:ring-amber-400/30"
              {...register('password')}
            />
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-medium text-lg rounded-xl transition-all shadow-[0_0_24px_rgba(217,119,6,0.5)] bg-amber-600 hover:bg-amber-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-amber-200/70">
          Don't have an account?{' '}
          <Link to="/signup" className="text-amber-300 font-medium hover:text-amber-200 hover:underline transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
