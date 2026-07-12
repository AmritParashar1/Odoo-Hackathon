import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const Signup = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    try {
      setError('');
      const res = await apiClient.post('/auth/register', data);
      login(res.data.data.accessToken, res.data.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md p-8 glass-panel rounded-2xl animate-fade-in text-white shadow-2xl border border-white/20 my-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-white/70 mt-2 text-sm">Join AssetFlow to manage resources</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive-foreground text-sm text-center">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white/80">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="John" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-primary/50"
                {...register('firstName')} 
              />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white/80">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Doe" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-primary/50"
                {...register('lastName')} 
              />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

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
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-primary/50"
              {...register('password')} 
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-white/60">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
