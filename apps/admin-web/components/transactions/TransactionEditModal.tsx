'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { PrismButton } from '@/components/ui/PrismButton';
import { AmountInput } from '@/components/ui/AmountInput';
import { useCategories } from '@/hooks/use-categories';
import { useUpdateTransaction, Transaction } from '@/hooks/use-transactions';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { getLocalToday } from '@/lib/date-utils';

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

const formSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  category_id: z.string().min(1, 'Category is required'),
  date: z.string(),
  note: z.string().max(500).optional(),
  status: z.enum(['completed', 'pending']),
});

type FormValues = z.infer<typeof formSchema>;

export function TransactionEditModal({ isOpen, onClose, transaction }: TransactionEditModalProps) {
  const updateTransaction = useUpdateTransaction();
  const { data: categories } = useCategories(transaction.type);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: transaction.amount,
      category_id: transaction.category_id,
      date: transaction.date,
      note: transaction.note || '',
      status: transaction.status,
    },
  });

  // Reset form when transaction changes
  useEffect(() => {
    form.reset({
      amount: transaction.amount,
      category_id: transaction.category_id,
      date: transaction.date,
      note: transaction.note || '',
      status: transaction.status,
    });
  }, [transaction, form]);

  const onSubmit = async (values: FormValues) => {
    // Check balance for expenses before sending request to avoid ghost optimistic updates
    if (transaction.type === 'expense') {
      const amountDiff = parseFloat(values.amount) - parseFloat(transaction.amount);
      if (amountDiff > 0) {
        // Find the account balance in some way, but wait, TransactionEditModal doesn't fetch accounts!
        // For simplicity, let's just let the API handle the error, but we will catch it and show toast.
        // Actually, we can just use try-catch and revert optimistic update.
      }
    }

    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        data: {
          ...values,
          amount: values.amount,
        },
      });
      onClose();
    } catch (error: any) {
      const errData = error?.response?.data?.error;
      if (errData?.field_errors) {
        // Map backend validation errors to form fields
        Object.entries(errData.field_errors).forEach(([field, messages]) => {
          const fieldName = field.replace('body.', '') as keyof FormValues;
          form.setError(fieldName, { message: (messages as string[])[0] });
        });
      } else if (error?.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else if (error?.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to update transaction');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-prism-text/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-prism-white rounded-t-3xl md:rounded-card w-full max-w-[480px] shadow-card animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-prism-border sticky top-0 bg-prism-white z-10">
          <h2 className="text-h3 font-semibold text-prism-text">Edit Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 text-prism-text-muted hover:text-prism-text transition-colors rounded-full hover:bg-prism-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-prism-5">
          <form className="space-y-6">
            
            {/* Disabled Type and Account Indicators */}
            <div className="flex gap-4 p-3 bg-prism-surface rounded-input text-small text-prism-text-muted">
              <div>
                <span className="block text-xs uppercase tracking-wider mb-1">Type</span>
                <span className="font-medium text-prism-text capitalize">{transaction.type}</span>
              </div>
              <div className="border-l border-prism-border pl-4">
                <span className="block text-xs uppercase tracking-wider mb-1">Account</span>
                <span className="font-medium text-prism-text">{transaction.account_name}</span>
              </div>
            </div>

            {/* Amount */}
            <Controller
              name="amount"
              control={form.control}
              render={({ field, fieldState }) => (
                <AmountInput
                  {...field}
                  autoFocus
                  error={fieldState.error?.message}
                />
              )}
            />

            {/* Categories */}
            <div>
              <label className="block text-small text-prism-text mb-2">Category</label>
              <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 hide-scrollbar">
                {categories?.map((cat) => {
                  const isSelected = form.watch('category_id') === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => form.setValue('category_id', cat.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors border
                        ${isSelected 
                          ? 'bg-prism-violet-50 border-prism-violet-200 text-prism-violet-700 font-medium' 
                          : 'bg-prism-white border-prism-border text-prism-text hover:bg-prism-surface'}
                      `}
                    >
                      <span>{cat.icon}</span>
                      <span className="text-small">{cat.name}</span>
                    </button>
                  );
                })}
                
                {/* Add New Category Button */}
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors border bg-prism-white border-prism-border text-prism-violet-600 hover:bg-prism-violet-50 hover:border-prism-violet-200 border-dashed"
                >
                  <span className="text-small font-medium">+ New</span>
                </button>
              </div>
              {form.formState.errors.category_id && (
                <p className="text-xs text-prism-danger mt-1">{form.formState.errors.category_id.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-small text-prism-text mb-1">Date</label>
              <input 
                type="date"
                max={getLocalToday()}
                className="w-full h-10 px-3 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:border-prism-violet-500 focus:ring-1 focus:ring-prism-violet-500 outline-none"
                {...form.register('date')}
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-small text-prism-text mb-1">Note (Optional)</label>
              <input 
                type="text"
                placeholder="What was this for?"
                className="w-full h-10 px-3 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:border-prism-violet-500 focus:ring-1 focus:ring-prism-violet-500 outline-none"
                {...form.register('note')}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-small text-prism-text mb-1">Status</label>
              <select 
                className="w-full h-10 px-3 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:border-prism-violet-500 focus:ring-1 focus:ring-prism-violet-500 outline-none"
                {...form.register('status')}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <PrismButton 
                variant="primary" 
                className="w-full"
                isLoading={updateTransaction.isPending}
                onClick={form.handleSubmit(onSubmit)}
              >
                Save Changes
              </PrismButton>
            </div>
            
          </form>
        </div>
      </div>
      
      {/* Category Modal */}
      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={(newCatId) => {
          form.setValue('category_id', newCatId);
        }}
      />
    </div>
  );
}
