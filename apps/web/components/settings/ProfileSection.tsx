'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock } from 'lucide-react';
import { useProfile, useUpdateProfile } from '../../hooks/use-settings';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().optional(),
  currency: z.string().default('INR'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSection() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      college: '',
      currency: 'INR',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name || '',
        college: profile.college || '',
        currency: profile.currency || 'INR',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile({
      full_name: data.fullName,
      college: data.college,
      currency: data.currency,
    }, {
      onSuccess: () => {
        // Form is no longer dirty after successful save, reset to new values
        reset(data);
      }
    });
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl"></div>;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-h3 font-semibold text-slate-900 mb-6 uppercase tracking-wider text-xs">Profile</h3>

      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
          <User className="w-8 h-8" />
        </div>
        <button className="text-sm font-semibold text-violet-600 hover:text-violet-700">
          Change photo
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            {...register('fullName')}
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all"
            placeholder="Your name"
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">College</label>
          <input
            {...register('college')}
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all"
            placeholder="Your college"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div className="relative">
            <input
              type="text"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 outline-none cursor-not-allowed pr-10"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>
          <p className="text-xs text-slate-500 mt-1">Email is managed by authentication provider.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
          <select
            {...register('currency')}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all bg-white appearance-none"
          >
            <option value="INR">INR (₹)</option>
          </select>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={!isDirty || isPending}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (profile) {
                reset({
                  fullName: profile.full_name || '',
                  college: profile.college || '',
                  currency: profile.currency || 'INR',
                });
              }
            }}
            disabled={!isDirty}
            className="px-4 py-2 text-violet-600 text-sm font-semibold hover:bg-violet-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
