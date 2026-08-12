"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PrismButton } from "@/components/ui/PrismButton";
import { PrismInput } from "@/components/ui/PrismInput";
import { AmountInput } from "@/components/ui/AmountInput";
import { useSavingsGoals } from "@/hooks/use-savings-goals";
import { motion, AnimatePresence } from "framer-motion";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const { createGoal } = useSavingsGoals();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [targetAmount, setTargetAmount] = useState<number | undefined>();
  const [monthlyContribution, setMonthlyContribution] = useState<number | undefined>();
  const [deadline, setDeadline] = useState("");

  const isPending = createGoal.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !monthlyContribution) return;

    createGoal.mutate(
      {
        name,
        icon: icon || null,
        target_amount: targetAmount,
        monthly_contribution: monthlyContribution,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      },
      {
        onSuccess: () => {
          onClose();
          // Reset form
          setName("");
          setIcon("");
          setTargetAmount(undefined);
          setMonthlyContribution(undefined);
          setDeadline("");
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
            className="relative w-full max-w-md max-h-full overflow-y-auto bg-prism-surface border border-prism-elevated rounded-3xl p-6 shadow-xl hide-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-h2 font-semibold text-prism-text">Create Savings Goal</h2>
              <button
                onClick={onClose}
                className="p-2 text-prism-text-muted hover:text-prism-text rounded-full hover:bg-prism-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PrismInput
                label="Goal Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New Car, Emergency Fund"
                required
              />

              <PrismInput
                label="Icon (Emoji)"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🚗"
                maxLength={2}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-prism-text-muted">Target Amount (₹)</label>
                <AmountInput
                  value={targetAmount}
                  onChange={(val) => setTargetAmount(val ? Number(val) : undefined)}
                  placeholder="₹100,000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-prism-text-muted">Monthly Contribution (₹)</label>
                <AmountInput
                  value={monthlyContribution}
                  onChange={(val) => setMonthlyContribution(val ? Number(val) : undefined)}
                  placeholder="₹5,000"
                />
              </div>

              <PrismInput
                label="Deadline (Optional)"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />

              <div className="pt-4">
                <PrismButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isPending}
                  disabled={!name || !targetAmount || !monthlyContribution}
                >
                  Create Goal
                </PrismButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
