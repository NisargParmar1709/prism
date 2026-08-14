'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark, Wallet, CreditCard, PiggyBank, ShieldAlert, CircleDollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { PrismInput } from '../ui/PrismInput';
import { AmountInput } from '../ui/AmountInput';
import { PrismButton } from '../ui/PrismButton';
import { useCreateAccount, AccountType } from '@/hooks/use-accounts';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50, 'Name is too long'),
  type: z.enum(['cash', 'bank', 'wallet', 'fd', 'savings', 'emergency'] as const),
  opening_balance: z.string().min(1, 'Opening balance is required'),
  last_4_digits: z.string().optional().nullable(),
  emergency_target: z.string().optional().nullable(),
}).refine((data) => {
  if (data.type === 'bank' && (!data.last_4_digits || data.last_4_digits.length !== 4)) {
    return false;
  }
  return true;
}, {
  message: 'Last 4 digits required for bank accounts (exactly 4 digits)',
  path: ['last_4_digits'],
});

type AccountFormData = z.infer<typeof accountSchema>;

const TYPE_OPTIONS: { value: AccountType, icon: React.ElementType, label: string }[] = [
  { value: 'cash', icon: CircleDollarSign, label: 'Cash' },
  { value: 'bank', icon: Landmark, label: 'Bank' },
  { value: 'wallet', icon: Wallet, label: 'Wallet' },
  { value: 'fd', icon: PiggyBank, label: 'FD' },
  { value: 'savings', icon: PiggyBank, label: 'Savings' },
  { value: 'emergency', icon: ShieldAlert, label: 'Emergency' },
];

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
  const { mutateAsync: createAccount, isPending } = useCreateAccount();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      type: 'bank',
      opening_balance: '0',
    },
  });

  const selectedType = watch('type');
  const openingBalance = watch('opening_balance');

  useEffect(() => {
    if (isOpen) {
      reset({
        type: 'bank',
        opening_balance: '0',
        name: '',
        last_4_digits: '',
        emergency_target: '',
      });
    }
  }, [isOpen, reset]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const onSubmit = async (data: AccountFormData) => {
    try {
      await createAccount({
        name: data.name,
        type: data.type,
        opening_balance: data.opening_balance || '0',
        last_4_digits: data.type === 'bank' ? data.last_4_digits : null,
        is_emergency_fund: data.type === 'emergency',
        emergency_target: data.type === 'emergency' ? data.emergency_target : null,
      });
      toast.success('Account created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create account');
      console.error(error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 pointer-events-none">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-[var(--prism-white)] rounded-t-[20px] sm:rounded-[20px] shadow-xl pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--prism-border)] shrink-0">
                <h2 className="text-h3 font-semibold text-[var(--prism-text)]">Add Account</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--prism-text-muted)] hover:text-[var(--prism-text)] hover:bg-[var(--prism-elevated)] rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                <form id="add-account-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Account Type Selector */}
                  <div className="space-y-2">
                    <label className="text-small text-[var(--prism-text)]">Account Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TYPE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedType === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setValue('type', option.value, { shouldValidate: true })}
                            className={`flex flex-col items-center justify-center p-3 rounded-input border transition-all ${
                              isSelected
                                ? 'border-[var(--prism-violet-500)] bg-[var(--prism-violet-50)] text-[var(--prism-violet-700)]'
                                : 'border-[var(--prism-border)] bg-transparent text-[var(--prism-text-muted)] hover:border-[var(--prism-border-strong)]'
                            }`}
                          >
                            <Icon size={24} className="mb-1" />
                            <span className="text-xs font-medium">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Common Fields */}
                  <div className="space-y-4">
                    <PrismInput
                      label="Account Name"
                      placeholder="e.g. HDFC Salary, Cash Wallet"
                      {...register('name')}
                      error={errors.name?.message}
                    />
                    
                    {selectedType === 'bank' && (
                      <PrismInput
                        label="Last 4 Digits"
                        placeholder="e.g. 1234"
                        maxLength={4}
                        {...register('last_4_digits')}
                        error={errors.last_4_digits?.message}
                      />
                    )}

                    <AmountInput
                      label="Opening Balance"
                      value={openingBalance}
                      onChange={(val) => setValue('opening_balance', val, { shouldValidate: true })}
                      error={errors.opening_balance?.message}
                    />

                    {selectedType === 'emergency' && (
                      <AmountInput
                        label="Target Amount"
                        value={watch('emergency_target') || ''}
                        onChange={(val) => setValue('emergency_target', val)}
                        error={errors.emergency_target?.message}
                      />
                    )}
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-[var(--prism-border)] shrink-0 bg-[var(--prism-white)] sm:rounded-b-[20px]">
                <PrismButton
                  type="submit"
                  form="add-account-form"
                  className="w-full"
                  isLoading={isPending}
                >
                  Create Account
                </PrismButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
