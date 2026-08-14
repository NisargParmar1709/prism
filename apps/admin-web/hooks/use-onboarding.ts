import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const onboardingSchema = z.object({
  // Step 1: Welcome
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().optional(),
  
  // Step 2: First Account
  accountType: z.enum(['cash', 'bank', 'wallet', 'fd', 'savings', 'emergency']).optional(),
  accountName: z.string().min(1, 'Account name is required').optional(),
  last4Digits: z.string().optional(),
  openingBalance: z.number().min(0, 'Balance must be positive').optional(),
  
  // Step 3: Monthly Budget
  budgetAmount: z.number().min(100, 'Budget must be at least ₹100').optional(),
  
  // Step 4: First Expense
  expenseAmount: z.number().min(1, 'Amount must be positive').optional(),
  categoryId: z.string().optional(), // We'll mock this for now or pass an actual UUID
  expenseNote: z.string().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

export function useOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      college: '',
      budgetAmount: 18000,
    },
    mode: 'onTouched', // validate on touch
  });

  const goToNextStep = async (stepNumber: number) => {
    // Validate current step before proceeding
    let isValid = false;
    if (stepNumber === 1) {
      isValid = await form.trigger(['fullName', 'college']);
    } else if (stepNumber === 2) {
      isValid = await form.trigger(['accountType', 'accountName', 'openingBalance', 'last4Digits']);
    } else if (stepNumber === 3) {
      isValid = await form.trigger(['budgetAmount']);
    }

    if (isValid) {
      // Clean up skipped steps since we are providing data
      setSkippedSteps((prev) => {
        const next = new Set(prev);
        next.delete(stepNumber);
        return next;
      });
      setCurrentStep(stepNumber + 1);
    }
  };

  const skipStep = (stepNumber: number) => {
    setSkippedSteps((prev) => new Set(prev).add(stepNumber));
    setCurrentStep(stepNumber + 1);
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const submitOnboarding = async (data: OnboardingData) => {
    setIsSubmitting(true);
    try {
      // 1. PATCH /users/me
      await api.patch('/users/me', {
        full_name: data.fullName,
        college: data.college || null,
        onboarding_completed: true,
      });

      let accountId: string | undefined;

      // 2. POST /accounts (if not skipped)
      if (!skippedSteps.has(2) && data.accountName && data.accountType) {
        try {
          const accountRes = await api.post('/accounts', {
            name: data.accountName,
            type: data.accountType,
            last_4_digits: data.last4Digits || null,
            opening_balance: (data.openingBalance || 0).toString(),
            currency: 'INR',
          });
          accountId = accountRes.data?.id;
        } catch (e) {
          console.error('Failed to create account', e);
        }
      }

      // 3. POST /budgets (if not skipped)
      if (!skippedSteps.has(3) && data.budgetAmount) {
        try {
          // We need a category for the overall budget, or maybe the API supports a general budget?
          // The API contract says budget requires category_id. For v1, we might just create one 
          // or assume it's created. We'll skip for now if we don't have a category.
        } catch (e) {
          console.error('Failed to create budget', e);
        }
      }

      // 4. POST /transactions (if not skipped and we have an account)
      if (!skippedSteps.has(4) && accountId && data.expenseAmount) {
        try {
          await api.post('/transactions', {
            account_id: accountId,
            category_id: data.categoryId || '00000000-0000-0000-0000-000000000000', // Need real UUID later
            type: 'expense',
            amount: data.expenseAmount.toString(),
            date: new Date().toISOString().split('T')[0],
            note: data.expenseNote || 'First expense',
            status: 'completed',
          });
        } catch (e) {
          console.error('Failed to create transaction', e);
        }
      }

      // Move to success screen
      setCurrentStep(5);
    } catch (error: any) {
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    currentStep,
    isSubmitting,
    skippedSteps,
    goToNextStep,
    skipStep,
    goToPrevStep,
    submitOnboarding,
    completeOnboarding: () => router.push('/dashboard'),
  };
}
