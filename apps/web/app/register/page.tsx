'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { signUp, signInWithGoogle } from '@/lib/auth';
import { PrismButton } from '@/components/ui/PrismButton';
import { PrismInput } from '@/components/ui/PrismInput';

// ─── Validation Schema ──────────────────────────────────────────────────────

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least 1 letter')
      .regex(/[0-9]/, 'Password must contain at least 1 number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Password Strength Component ─────────────────────────────────────────────

function PasswordStrengthIndicator({ password }: { password: string }) {
  const rules = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Contains a letter', met: /[a-zA-Z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {rules.map((rule) => (
        <div
          key={rule.label}
          className={`flex items-center gap-1.5 text-xs ${
            rule.met ? 'text-prism-success-text' : 'text-prism-text-muted'
          }`}
        >
          {rule.met ? (
            <Check className="w-3 h-3 text-prism-success" />
          ) : (
            <X className="w-3 h-3 text-prism-text-muted" />
          )}
          {rule.label}
        </div>
      ))}
    </div>
  );
}

// ─── Register Page Component ────────────────────────────────────────────────

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const watchPassword = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);

    try {
      const result = await signUp(data.email, data.password, data.email.split('@')[0]);

      if (result?.requireEmailVerification) {
        setEmailSent(true);
        toast.success('Account created! Check your email.');
      }
    } catch (err: unknown) {
      const error = err as { message?: string; error?: string };

      if (error?.error === 'USER_ALREADY_EXISTS' || error?.message?.includes('already')) {
        toast.error('An account with this email already exists.');
      } else {
        toast.error(error?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Email Sent Success State ─────────────────────────────────────────────

  if (emailSent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-prism-surface p-prism-4">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-display gradient-text">Prism</h1>
          </div>

          <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card space-y-5 text-center">
            {/* Email Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-prism-violet-50 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-prism-violet-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>

            <h2 className="text-h2 text-prism-text">Check your email</h2>
            <p className="text-body text-prism-text-secondary">
              We&apos;ve sent a verification link to your email address.
              Click the link to verify your account, then come back here to sign in.
            </p>

            <div className="pt-2">
              <Link href="/login">
                <PrismButton variant="primary" className="w-full">
                  Go to Sign in
                </PrismButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── Registration Form ────────────────────────────────────────────────────

  return (
    <main className="flex min-h-screen items-center justify-center bg-prism-surface p-prism-4">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <h1 className="text-display gradient-text">Prism</h1>
          <p className="text-body text-prism-text-secondary">
            Start tracking your finances in minutes.
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card space-y-5">
          <h2 className="text-h2 text-prism-text text-center">Create account</h2>

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
            <div>
              <div className="relative">
                <PrismInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
              <PasswordStrengthIndicator password={watchPassword} />
            </div>

            {/* Confirm Password */}
            <PrismInput
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-0.5 h-4 w-4 rounded border-prism-border text-prism-violet-600 focus:ring-prism-violet-500 accent-prism-violet-600"
                {...register('acceptTerms')}
              />
              <label
                htmlFor="acceptTerms"
                className="text-small text-prism-text-secondary cursor-pointer"
              >
                I agree to the{' '}
                <span className="text-prism-violet-600 hover:text-prism-violet-700">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-prism-violet-600 hover:text-prism-violet-700">
                  Privacy Policy
                </span>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-prism-danger -mt-2">
                {errors.acceptTerms.message}
              </p>
            )}

            {/* Submit */}
            <PrismButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="w-full"
            >
              Create account
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
                toast.error('Google sign-up failed. Please try again.');
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

        {/* Login Link */}
        <p className="text-center text-body text-prism-text-secondary">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-prism-violet-600 hover:text-prism-violet-700 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
