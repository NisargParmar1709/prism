'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays, addWeeks, addMonths, addYears, parseISO } from 'date-fns';

import { PrismButton } from '@/components/ui/PrismButton';
import { AmountInput } from '@/components/ui/AmountInput';
import { useCategories } from '@/hooks/use-categories';
import { useAccounts } from '@/hooks/use-accounts';
import { useCreateTransaction, useCreateRecurringRule } from '@/hooks/use-transactions';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { getLocalToday } from '@/lib/date-utils';
import toast from 'react-hot-toast';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.string().min(1, 'Amount is required').refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  category_id: z.string().min(1, 'Category is required'),
  account_id: z.string().min(1, 'Account is required'),
  date: z.string(),
  note: z.string().max(500).optional(),
  repeat: z.enum(['none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).default('none'),
});

type FormValues = z.infer<typeof formSchema>;

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const { data: accounts } = useAccounts();
  const createTransaction = useCreateTransaction();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category_id: '',
      account_id: '',
      date: getLocalToday(),
      note: '',
      repeat: 'none',
    },
  });

  const createRecurringRule = useCreateRecurringRule();

  const selectedType = form.watch('type');
  const { data: categories } = useCategories(selectedType);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Set defaults when data loads
  useEffect(() => {
    if (accounts && accounts.length > 0 && !form.getValues('account_id')) {
      form.setValue('account_id', accounts[0].id);
    }
  }, [accounts, form]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const currentVal = form.getValues('category_id');
      const isValid = categories.some((c) => c.id === currentVal);
      if (!isValid) {
        form.setValue('category_id', categories[0].id);
      }
    }
  }, [categories, form, selectedType]);

  const onSubmit = async (values: FormValues, addAnother: boolean = false) => {
    // Check balance for expenses before sending request to avoid ghost optimistic updates
    if (values.type === 'expense') {
      const selectedAccount = accounts?.find(a => a.id === values.account_id);
      if (selectedAccount) {
        if (parseFloat(values.amount) > parseFloat(selectedAccount.current_balance || '0')) {
          form.setError('amount', { message: 'Insufficient funds in this account' });
          return;
        }
      }
    }

    try {
      await createTransaction.mutateAsync({
        ...values,
        tags: [],
        status: 'completed',
      });
      
      if (values.repeat !== 'none') {
        // Calculate the next run date based on the chosen frequency so it doesn't duplicate today's tx
        const d = parseISO(values.date);
        let nextDate = d;
        switch (values.repeat) {
          case 'daily': nextDate = addDays(d, 1); break;
          case 'weekly': nextDate = addWeeks(d, 1); break;
          case 'biweekly': nextDate = addWeeks(d, 2); break;
          case 'monthly': nextDate = addMonths(d, 1); break;
          case 'quarterly': nextDate = addMonths(d, 3); break;
          case 'yearly': nextDate = addYears(d, 1); break;
        }

        await createRecurringRule.mutateAsync({
          account_id: values.account_id,
          category_id: values.category_id,
          type: values.type,
          amount: values.amount,
          frequency: values.repeat as any,
          start_date: format(nextDate, 'yyyy-MM-dd'),
          note: values.note,
        });
      }
      
      if (addAnother) {
        form.reset({
          ...values,
          amount: '',
          note: '',
          repeat: 'none',
        });
        toast.success('Transaction added');
      } else {
        toast.success('Transaction added');
        onClose();
        form.reset();
      }
    } catch (error: any) {
      // Use API error message if provided
      if (error?.response?.data?.detail) {
        toast.error(error.response.data.detail);
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
          <h2 className="text-h3 font-semibold text-prism-text">Quick Add</h2>
          <button
            onClick={onClose}
            className="p-2 text-prism-text-muted hover:text-prism-text transition-colors rounded-full hover:bg-prism-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-prism-5">
          <form className="space-y-6">
            
            {/* Type Toggle */}
            <div className="flex bg-prism-surface p-1 rounded-input">
              <button
                type="button"
                onClick={() => form.setValue('type', 'expense')}
                className={`flex-1 py-2 text-small font-medium rounded-md transition-colors ${
                  selectedType === 'expense' 
                    ? 'bg-prism-white text-prism-danger shadow-sm' 
                    : 'text-prism-text-muted hover:text-prism-text'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => form.setValue('type', 'income')}
                className={`flex-1 py-2 text-small font-medium rounded-md transition-colors ${
                  selectedType === 'income' 
                    ? 'bg-prism-white text-prism-success shadow-sm' 
                    : 'text-prism-text-muted hover:text-prism-text'
                }`}
              >
                Income
              </button>
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

            {/* Account & Date row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-small text-prism-text mb-1">Account</label>
                <select 
                  className="w-full h-10 px-3 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:border-prism-violet-500 focus:ring-1 focus:ring-prism-violet-500 outline-none"
                  {...form.register('account_id')}
                >
                  <option value="">Select Account</option>
                  {accounts?.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                {form.formState.errors.account_id && (
                  <p className="text-xs text-prism-danger mt-1">{form.formState.errors.account_id.message}</p>
                )}
              </div>
              <div>
                <label className="block text-small text-prism-text mb-1">Date</label>
                <input 
                  type="date"
                  max={getLocalToday()}
                  className="w-full h-10 px-3 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:border-prism-violet-500 focus:ring-1 focus:ring-prism-violet-500 outline-none"
                  {...form.register('date')}
                />
              </div>
            </div>

            {/* Note & Repeat row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-small text-prism-text mb-1">Note (Optional)</label>
                <input 
                  type="text"
                  placeholder="What was this for?"
                  className="w-full h-10 px-3 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:border-prism-violet-500 focus:ring-1 focus:ring-prism-violet-500 outline-none"
                  {...form.register('note')}
                />
              </div>
              <div>
                <label className="block text-small text-prism-text mb-1">Repeat</label>
                <select 
                  className="w-full h-10 px-3 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:border-prism-violet-500 focus:ring-1 focus:ring-prism-violet-500 outline-none"
                  {...form.register('repeat')}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 Weeks</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <PrismButton 
                variant="primary" 
                className="w-full"
                isLoading={createTransaction.isPending}
                onClick={form.handleSubmit((v) => onSubmit(v, false))}
              >
                Save
              </PrismButton>
              <PrismButton 
                variant="secondary" 
                className="w-full"
                type="button"
                disabled={createTransaction.isPending}
                onClick={form.handleSubmit((v) => onSubmit(v, true))}
              >
                Save & Add Another
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
