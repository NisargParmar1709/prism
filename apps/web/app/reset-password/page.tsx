'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, KeyRound, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { resetPassword } from '@/lib/auth';
import { PrismButton } from '@/components/ui/PrismButton';
import { PrismInput } from '@/components/ui/PrismInput';

// ─── Validation Schema ──────────────────────────────────────────────────────

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least 1 letter')
      .regex(/[0-9]/, 'Password must contain at least 1 number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

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

import { Suspense } from 'react';

// ─── Component ──────────────────────────────────────────────────────────────

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // InsForge link-based reset: URL contains ?token=...&insforge_status=ready&insforge_type=reset_password
  const token = searchParams.get('token');
  const insforgeStatus = searchParams.get('insforge_status');
  const insforgeError = searchParams.get('insforge_error');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchPassword = watch('newPassword', '');

  // ─── Error State ──────────────────────────────────────────────────────────

  if (insforgeStatus === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-prism-surface p-prism-4">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-display gradient-text">Prism</h1>
          </div>

          <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card space-y-5 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-prism-danger-bg flex items-center justify-center">
              <X className="w-8 h-8 text-prism-danger" />
            </div>

            <h2 className="text-h2 text-prism-text">Reset link expired</h2>
            <p className="text-body text-prism-text-secondary">
              {insforgeError || 'This password reset link has expired or is invalid.'}
            </p>

            <div className="pt-2 space-y-3">
              <Link href="/forgot-password">
                <PrismButton variant="primary" className="w-full">
                  Request a new link
                </PrismButton>
              </Link>
              <Link href="/login">
                <PrismButton variant="text" className="w-full">
                  Back to Sign in
                </PrismButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── No Token State ───────────────────────────────────────────────────────

  if (!token || insforgeStatus !== 'ready') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-prism-surface p-prism-4">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-display gradient-text">Prism</h1>
          </div>

          <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card space-y-5 text-center">
            <h2 className="text-h2 text-prism-text">Invalid reset link</h2>
            <p className="text-body text-prism-text-secondary">
              This page can only be accessed from a password reset email link.
            </p>

            <div className="pt-2 space-y-3">
              <Link href="/forgot-password">
                <PrismButton variant="primary" className="w-full">
                  Request a reset link
                </PrismButton>
              </Link>
              <Link href="/login">
                <PrismButton variant="text" className="w-full">
                  Back to Sign in
                </PrismButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── Reset Password Form ──────────────────────────────────────────────────

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);

    try {
      await resetPassword(data.newPassword, token);
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || 'Failed to reset password. Please try again.');
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
            Set your new password
          </p>
        </div>

        {/* Card */}
        <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card space-y-5">
          <h2 className="text-h2 text-prism-text text-center">Reset password</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <div className="relative">
                <PrismInput
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
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
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <PrismButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<KeyRound className="w-4 h-4" />}
              className="w-full"
            >
              Reset password
            </PrismButton>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-prism-surface flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
