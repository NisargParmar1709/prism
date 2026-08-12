'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

import { sendPasswordReset } from '@/lib/auth';
import { PrismButton } from '@/components/ui/PrismButton';
import { PrismInput } from '@/components/ui/PrismInput';

// ─── Validation Schema ──────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ─── Component ──────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);

    try {
      await sendPasswordReset(data.email);
      setEmailSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err: unknown) {
      // InsForge prevents user enumeration — always shows success
      // But if there's a network error, show it
      const error = err as { message?: string };
      toast.error(error?.message || 'Something went wrong. Please try again.');
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
            <div className="mx-auto w-16 h-16 rounded-full bg-prism-violet-50 flex items-center justify-center">
              <Mail className="w-8 h-8 text-prism-violet-500" />
            </div>

            <h2 className="text-h2 text-prism-text">Check your email</h2>
            <p className="text-body text-prism-text-secondary">
              We&apos;ve sent a password reset link to your email.
              Click the link to set a new password.
            </p>

            <div className="pt-2">
              <Link href="/login">
                <PrismButton variant="outline" className="w-full">
                  Back to Sign in
                </PrismButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  return (
    <main className="flex min-h-screen items-center justify-center bg-prism-surface p-prism-4">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <h1 className="text-display gradient-text">Prism</h1>
          <p className="text-body text-prism-text-secondary">
            Reset your password
          </p>
        </div>

        {/* Card */}
        <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card space-y-5">
          <h2 className="text-h2 text-prism-text text-center">Forgot password</h2>
          <p className="text-body text-prism-text-muted text-center">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <PrismInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <PrismButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full"
            >
              Send reset link
            </PrismButton>
          </form>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-small text-prism-violet-600 hover:text-prism-violet-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
