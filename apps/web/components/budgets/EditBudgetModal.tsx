'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import { PrismButton } from '@/components/ui/PrismButton';
import { useUpdateBudget, Budget } from '@/hooks/use-budgets';

const budgetSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}

export function EditBudgetModal({ isOpen, onClose, budget }: EditBudgetModalProps) {
  const updateBudget = useUpdateBudget();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      amount: '',
    },
  });

  useEffect(() => {
    if (budget) {
      reset({ amount: budget.amount });
    }
  }, [budget, reset]);

  const onSubmit = async (data: BudgetFormValues) => {
    if (!budget) return;
    
    setServerError(null);
    updateBudget.mutate(
      {
        id: budget.id,
        amount: data.amount,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (err: any) => {
          setServerError(err.response?.data?.detail || 'Failed to update budget');
        },
      }
    );
  };

  if (!isOpen || !budget) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-prism-text/20 backdrop-blur-sm z-40 animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-prism-white rounded-card shadow-modal z-50 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-prism-5 border-b border-prism-border">
          <h2 className="text-h3 font-semibold text-prism-text">Edit Budget</h2>
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
            <div className="w-full h-11 px-3 rounded-xl border border-prism-border bg-prism-surface/50 text-prism-text flex items-center">
              {budget.category_icon} <span className="ml-2">{budget.category_name}</span>
            </div>
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
              disabled={isSubmitting || updateBudget.isPending}
            >
              {(isSubmitting || updateBudget.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </PrismButton>
          </div>
        </form>
      </div>
    </>
  );
}
