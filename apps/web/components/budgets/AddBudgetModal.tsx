'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import { PrismButton } from '@/components/ui/PrismButton';
import { useCategories } from '@/hooks/use-categories';
import { useCreateBudget } from '@/hooks/use-budgets';

const budgetSchema = z.object({
  category_id: z.string().min(1, 'Please select a category'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: string; // YYYY-MM
}

export function AddBudgetModal({ isOpen, onClose, period }: AddBudgetModalProps) {
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories('expense');
  const createBudget = useCreateBudget();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: '',
      amount: '',
    },
  });

  const onSubmit = async (data: BudgetFormValues) => {
    setServerError(null);
    createBudget.mutate(
      {
        category_id: data.category_id,
        amount: data.amount,
        period: period,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (err: any) => {
          setServerError(err.response?.data?.detail || 'Failed to create budget');
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-prism-text/20 backdrop-blur-sm z-40 animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-prism-white rounded-card shadow-modal z-50 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-prism-5 border-b border-prism-border">
          <h2 className="text-h3 font-semibold text-prism-text">Set Budget</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-prism-text-muted hover:text-prism-text hover:bg-prism-surface rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-prism-5 space-y-4">
          {serverError && (
            <div className="p-3 bg-prism-danger-bg text-prism-danger-text text-sm rounded-lg border border-prism-danger/20">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-small font-medium text-prism-text">Category</label>
            <select
              {...register('category_id')}
              className={`w-full h-11 px-3 rounded-xl border bg-prism-surface/50 text-prism-text outline-none transition-colors ${
                errors.category_id ? 'border-prism-danger focus:border-prism-danger' : 'border-prism-border focus:border-prism-violet-500'
              }`}
              disabled={isLoadingCategories}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-xs text-prism-danger mt-1">{errors.category_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-small font-medium text-prism-text">Monthly Limit (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-prism-text-muted font-medium">₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
                className={`w-full h-11 pl-8 pr-4 rounded-xl border bg-prism-surface/50 text-prism-text font-mono outline-none transition-colors ${
                  errors.amount ? 'border-prism-danger focus:border-prism-danger' : 'border-prism-border focus:border-prism-violet-500'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-prism-danger mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div className="pt-2">
            <PrismButton 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || createBudget.isPending}
            >
              {(isSubmitting || createBudget.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                'Set Budget'
              )}
            </PrismButton>
          </div>
        </form>
      </div>
    </>
  );
}
