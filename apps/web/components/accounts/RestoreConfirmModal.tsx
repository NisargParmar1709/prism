'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PrismButton } from '../ui/PrismButton';
import { useRestoreAccount, Account } from '@/hooks/use-accounts';

interface RestoreConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

export function RestoreConfirmModal({ isOpen, onClose, account }: RestoreConfirmModalProps) {
  const { mutateAsync: restoreAccount, isPending } = useRestoreAccount();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const onConfirm = async () => {
    if (!account) return;
    
    try {
      await restoreAccount(account.id);
      toast.success('Account restored successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to restore account');
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[var(--prism-white)] rounded-[20px] shadow-xl pointer-events-auto flex flex-col overflow-hidden"
            >
              <div className="flex flex-col items-center p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--prism-violet-50)] text-[var(--prism-violet-600)] mb-4">
                  <RefreshCcw size={24} />
                </div>
                
                <h3 className="text-h3 font-semibold text-[var(--prism-text)] mb-2">
                  Restore {account.name}?
                </h3>
                
                <p className="text-body text-[var(--prism-text-muted)] mb-6">
                  This account and its balance will immediately become active again and appear in your dashboard totals.
                </p>

                <div className="flex flex-col w-full gap-3 sm:flex-row-reverse sm:justify-end">
                  <PrismButton
                    variant="primary"
                    onClick={onConfirm}
                    isLoading={isPending}
                    className="w-full sm:w-auto"
                  >
                    Restore
                  </PrismButton>
                  
                  <PrismButton
                    variant="text"
                    onClick={onClose}
                    disabled={isPending}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </PrismButton>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
