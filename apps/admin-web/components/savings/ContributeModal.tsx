"use client";

import { useState, useEffect } from "react";
import { X, Coins } from "lucide-react";
import { PrismButton } from "@/components/ui/PrismButton";
import { AmountInput } from "@/components/ui/AmountInput";
import { useSavingsGoals, SavingsGoal } from "@/hooks/use-savings-goals";
import { motion, AnimatePresence } from "framer-motion";

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export function ContributeModal({ isOpen, onClose, goal }: ContributeModalProps) {
  const { contributeGoal } = useSavingsGoals();
  const [amount, setAmount] = useState<number | undefined>();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) setAmount(undefined);
  }, [isOpen]);

  const isPending = contributeGoal.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !amount) return;

    contributeGoal.mutate(
      { id: goal.id, amount },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-prism-bg/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="relative w-full max-w-sm max-h-full overflow-y-auto bg-prism-surface border border-prism-elevated rounded-3xl p-6 shadow-xl hide-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-h2 font-semibold text-prism-text flex items-center gap-2">
                <Coins className="w-5 h-5 text-prism-violet-500" /> Contribute
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-prism-text-muted hover:text-prism-text rounded-full hover:bg-prism-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center p-4 bg-prism-elevated rounded-2xl">
                <div className="text-sm text-prism-text-muted mb-1">Contributing to</div>
                <div className="text-lg font-semibold text-prism-text">{goal?.name}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-prism-text-muted">Amount (₹)</label>
                <AmountInput
                  value={amount}
                  onChange={(val) => setAmount(val ? Number(val) : undefined)}
                  placeholder="₹1,000"
                  autoFocus
                />
              </div>

              <PrismButton
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isPending}
                disabled={!amount || amount <= 0}
              >
                Add Funds
              </PrismButton>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
