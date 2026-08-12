'use client';

import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, AlertCircle, Wallet } from 'lucide-react';
import { PrismButton } from '@/components/ui/PrismButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { BalanceToggle } from '@/components/accounts/BalanceToggle';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AddAccountModal } from '@/components/accounts/AddAccountModal';
import { useAccounts } from '@/hooks/use-accounts';
import { useBalanceVisibility } from '@/components/providers/BalanceProvider';

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AccountsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { showBalance } = useBalanceVisibility();
  
  // We need to fetch all accounts (including archived if showArchived is true)
  // Actually, let's just fetch all and filter client side to avoid refetching on toggle
  const { data: accounts, isLoading, error, refetch } = useAccounts(true);

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-12 h-12 text-prism-danger mb-4" />
        <h2 className="text-h3 font-semibold mb-2">Failed to load accounts</h2>
        <p className="text-prism-text-muted mb-6">There was a problem communicating with the server.</p>
        <PrismButton onClick={() => refetch()}>Try Again</PrismButton>
      </div>
    );
  }

  const activeAccounts = accounts?.filter(a => !a.is_archived) || [];
  const archivedAccounts = accounts?.filter(a => a.is_archived) || [];

  const totalBalance = activeAccounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);
  
  // Separate into regular accounts and savings/emergency
  const standardAccounts = activeAccounts.filter(a => !['savings', 'emergency'].includes(a.type));
  const savingsAccounts = activeAccounts.filter(a => ['savings', 'emergency'].includes(a.type));

  const displayTotal = showBalance ? formatCurrency(totalBalance, 'INR') : '••••••';

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-h1 font-semibold text-[var(--prism-text)]">Accounts</h1>
        <div className="hidden sm:block">
          <PrismButton leftIcon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
            Add Account
          </PrismButton>
        </div>
      </div>

      {/* Total Balance Section */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-small font-medium text-[var(--prism-text-muted)] uppercase tracking-wider">
            Total Net Worth
          </span>
          <BalanceToggle />
        </div>
        <div className="text-[40px] leading-tight font-semibold text-[var(--prism-text)] tracking-tight">
          {isLoading ? <Skeleton className="h-12 w-48" /> : displayTotal}
        </div>
      </section>

      {/* Main Content */}
      <div className="space-y-10">
        
        {/* Active Accounts List */}
        <section>
          <h2 className="text-h3 font-medium text-[var(--prism-text)] mb-4">Your Accounts</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-[16px]" />)}
            </div>
          ) : standardAccounts.length === 0 ? (
            <EmptyState
              icon={<Wallet />}
              title="No accounts yet"
              description="Add your first bank account or wallet to get started tracking your money."
              actionLabel="Add Account"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {standardAccounts.map(account => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          )}
        </section>

        {/* Savings & Goals */}
        {(savingsAccounts.length > 0 || isLoading) && (
          <section>
            <h2 className="text-h3 font-medium text-[var(--prism-text)] mb-4">Savings & Goals</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full rounded-[16px]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savingsAccounts.map(account => {
                  const current = Number(account.current_balance);
                  const target = account.type === 'emergency' && account.emergency_target 
                    ? Number(account.emergency_target) 
                    : null;
                  
                  // For goals/emergency with targets, show progress
                  return (
                    <div key={account.id} className="relative">
                      <AccountCard account={account} />
                      {target && target > 0 && (
                        <div className="absolute bottom-3 left-16 right-4">
                          <ProgressBar 
                            value={Math.min(100, (current / target) * 100)} 
                            className="opacity-70"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Archived Accounts */}
        {!isLoading && archivedAccounts.length > 0 && (
          <section>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-small font-medium text-[var(--prism-text-muted)] hover:text-[var(--prism-text)] transition-colors mb-4"
            >
              {showArchived ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              Archived Accounts ({archivedAccounts.length})
            </button>
            
            {showArchived && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {archivedAccounts.map(account => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Mobile FAB */}
      <div className="fixed bottom-20 right-4 sm:hidden z-30">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 bg-prism-violet-600 text-prism-white rounded-full flex items-center justify-center shadow-lg hover:bg-prism-violet-700 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
