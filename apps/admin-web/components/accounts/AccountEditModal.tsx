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
import { useUpdateAccount, Account, AccountType } from '@/hooks/use-accounts';

interface AccountEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

const editAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50, 'Name is too long'),
  opening_balance: z.string().min(1, 'Opening balance is required'),
  last_4_digits: z.string().optional().nullable(),
  emergency_target: z.string().optional().nullable(),
});

type EditAccountFormData = z.infer<typeof editAccountSchema>;

const TYPE_OPTIONS: { value: AccountType, icon: React.ElementType, label: string }[] = [
  { value: 'cash', icon: CircleDollarSign, label: 'Cash' },
  { value: 'bank', icon: Landmark, label: 'Bank' },
  { value: 'wallet', icon: Wallet, label: 'Wallet' },
  { value: 'fd', icon: PiggyBank, label: 'FD' },
  { value: 'savings', icon: PiggyBank, label: 'Savings' },
  { value: 'emergency', icon: ShieldAlert, label: 'Emergency' },
];

export function AccountEditModal({ isOpen, onClose, account }: AccountEditModalProps) {
  const { mutateAsync: updateAccount, isPending } = useUpdateAccount(account?.id || '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditAccountFormData>({
    resolver: zodResolver(editAccountSchema),
  });

  const openingBalance = watch('opening_balance');

  useEffect(() => {
    if (isOpen && account) {
      reset({
        name: account.name,
        opening_balance: account.opening_balance,
        last_4_digits: account.last_4_digits || '',
        emergency_target: account.emergency_target || '',
      });
    }
  }, [isOpen, account, reset]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const onSubmit = async (data: EditAccountFormData) => {
    if (!account) return;
    
    try {
      await updateAccount({
        name: data.name,
        opening_balance: data.opening_balance,
        last_4_digits: account.type === 'bank' ? (data.last_4_digits || null) : null,
        emergency_target: account.type === 'emergency' ? (data.emergency_target || null) : null,
      });
      toast.success('Account updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update account');
      console.error(error);
    }
  };

  if (!account) return null;

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
                <h2 className="text-h3 font-semibold text-[var(--prism-text)]">Edit Account</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--prism-text-muted)] hover:text-[var(--prism-text)] hover:bg-[var(--prism-elevated)] rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                <form id="edit-account-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Account Type Selector (Disabled) */}
                  <div className="space-y-2 opacity-60">
                    <label className="text-small text-[var(--prism-text)]">Account Type (Cannot be changed)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TYPE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = account.type === option.value;
                        if (!isSelected) return null; // Only show the selected one or show all but disabled
                        return (
                          <div
                            key={option.value}
                            className={`flex flex-col items-center justify-center p-3 rounded-input border transition-all col-span-3 border-[var(--prism-violet-500)] bg-[var(--prism-violet-50)] text-[var(--prism-violet-700)] cursor-not-allowed`}
                          >
                            <Icon size={24} className="mb-1" />
                            <span className="text-xs font-medium">{option.label}</span>
                          </div>
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
                    
                    {account.type === 'bank' && (
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
                      value={openingBalance || '0'}
                      onChange={(val) => setValue('opening_balance', val, { shouldValidate: true })}
                      error={errors.opening_balance?.message}
                    />

                    {account.type === 'emergency' && (
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
                  form="edit-account-form"
                  className="w-full"
                  isLoading={isPending}
                >
                  Save Changes
                </PrismButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
