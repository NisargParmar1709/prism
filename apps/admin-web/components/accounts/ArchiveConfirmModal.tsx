'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PrismButton } from '../ui/PrismButton';
import { useArchiveAccount, Account } from '@/hooks/use-accounts';
import { useRouter } from 'next/navigation';

interface ArchiveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

export function ArchiveConfirmModal({ isOpen, onClose, account }: ArchiveConfirmModalProps) {
  const { mutateAsync: archiveAccount, isPending } = useArchiveAccount();
  const router = useRouter();

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
      await archiveAccount(account.id);
      toast.success('Account archived successfully');
      onClose();
      router.push('/accounts'); // Redirect to accounts list after archiving
    } catch (error) {
      toast.error('Failed to archive account');
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
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--prism-danger-light)] text-[var(--prism-danger)] mb-4">
                  <AlertTriangle size={24} />
                </div>
                
                <h3 className="text-h3 font-semibold text-[var(--prism-text)] mb-2">
                  Archive {account.name}?
                </h3>
                
                <p className="text-body text-[var(--prism-text-muted)] mb-6">
                  Historical transactions will be preserved. You can always restore this account later.
                </p>

                <div className="flex flex-col w-full gap-3 sm:flex-row-reverse sm:justify-end">
                  <PrismButton
                    variant="danger"
                    onClick={onConfirm}
                    isLoading={isPending}
                    className="w-full sm:w-auto"
                  >
                    Archive
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
