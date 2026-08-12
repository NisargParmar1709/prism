'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

import { signIn, signInWithGoogle } from '@/lib/auth';
import { PrismButton } from '@/components/ui/PrismButton';
import { PrismInput } from '@/components/ui/PrismInput';

// ─── Validation Schema ──────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

import { Suspense } from 'react';

// ─── Login Page Component ────────────────────────────────────────────────────

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Handle InsForge email verification redirect params
  useEffect(() => {
    const status = searchParams.get('insforge_status');
    const type = searchParams.get('insforge_type');
    const errorMsg = searchParams.get('insforge_error');

    if (type === 'verify_email') {
      if (status === 'success') {
        toast.success('Email verified! You can now sign in.');
      } else if (status === 'error') {
        toast.error(errorMsg || 'Email verification failed. Please try again.');
      }
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      const result = await signIn(data.email, data.password);

      if (!result?.user?.emailVerified) {
        toast.error('Please verify your email before signing in.');
        setIsSubmitting(false);
        return;
      }

      toast.success('Welcome back!');

      // Check if onboarding is completed by fetching profile from our API
      // For now, redirect to dashboard — the dashboard/onboarding guard will handle routing
      try {
        const token = result.accessToken;
        if (token) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const profile = await res.json();
            if (!profile.onboarding_completed) {
              router.push('/onboarding');
              return;
            }
          } else if (res.status === 404) {
            // Profile doesn't exist yet, must do onboarding
            router.push('/onboarding');
            return;
          }
        }
      } catch {
        // If profile fetch fails completely due to network, default to dashboard
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string; error?: string };

      if (error?.error === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email before signing in.');
      } else {
        toast.error(error?.message || 'Invalid email or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-prism-surface p-prism-4">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <h1 className="text-display gradient-text">Prism</h1>
          <p className="text-body text-prism-text-secondary">
            Welcome back. See your money clearly.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card space-y-5">
          <h2 className="text-h2 text-prism-text text-center">Sign in</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <PrismInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password */}
            <div className="relative">
              <PrismInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[30px] text-prism-text-muted hover:text-prism-text-secondary transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-small text-prism-violet-600 hover:text-prism-violet-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <PrismButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full"
            >
              Sign in
            </PrismButton>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-prism-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-prism-white px-3 text-prism-text-muted">or</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={async () => {
              setIsGoogleLoading(true);
              try {
                await signInWithGoogle();
              } catch {
                toast.error('Google sign-in failed. Please try again.');
                setIsGoogleLoading(false);
              }
            }}
            disabled={isGoogleLoading}
            className="w-full h-10 flex items-center justify-center gap-2.5 rounded-button border border-prism-border bg-prism-white text-small font-semibold text-prism-text hover:bg-prism-surface hover:border-prism-border-strong transition-all duration-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-prism-text-muted border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-body text-prism-text-secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-prism-violet-600 hover:text-prism-violet-700 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-prism-surface flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
