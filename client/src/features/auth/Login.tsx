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
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md p-8 glass-panel rounded-2xl animate-fade-in text-white shadow-2xl border border-white/20">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md mb-4 border border-primary/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AssetFlow</h1>
          <p className="text-white/70 mt-2 text-sm">Enterprise Resource Management</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive-foreground text-sm text-center">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@company.com" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-primary/50"
              {...register('email')} 
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-primary/50"
              {...register('password')} 
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-white/60">
          Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
};
