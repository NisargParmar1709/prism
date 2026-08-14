'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Landmark, 
  Wallet, 
  PiggyBank, 
  ShieldAlert, 
  CircleDollarSign,
  Edit2,
  Archive,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity
} from 'lucide-react';
import { PrismButton } from '@/components/ui/PrismButton';
import { useBalanceVisibility } from '@/components/providers/BalanceProvider';
import { formatCurrency, cn } from '@/lib/utils';
import { useAccount, AccountType } from '@/hooks/use-accounts';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { AccountEditModal } from '@/components/accounts/AccountEditModal';
import { ArchiveConfirmModal } from '@/components/accounts/ArchiveConfirmModal';
import { RestoreConfirmModal } from '@/components/accounts/RestoreConfirmModal';

const TYPE_ICONS: Record<AccountType, React.ElementType> = {
  cash: CircleDollarSign,
  bank: Landmark,
  wallet: Wallet,
  fd: PiggyBank,
  savings: PiggyBank,
  emergency: ShieldAlert,
};

const TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Cash',
  bank: 'Bank Account',
  wallet: 'Wallet',
  fd: 'Fixed Deposit',
  savings: 'Savings',
  emergency: 'Emergency Fund',
};

export default function AccountDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { showBalance } = useBalanceVisibility();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');

  // Fetch account data
  const { data: account, isLoading: isLoadingAccount, error: accountError } = useAccount(id);
  
  // Fetch transactions data
  const { data: transactionsData, isLoading: isLoadingTransactions } = useTransactions({ account_id: id });

  if (accountError) {
    if ((accountError as any).response?.status === 404) {
      notFound();
    }
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="text-prism-danger">Failed to load account details.</div>
      </div>
    );
  }

  if (isLoadingAccount) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-prism-border border-t-prism-violet-500" />
      </div>
    );
  }

  if (!account) return null;

  const Icon = TYPE_ICONS[account.type] || CircleDollarSign;
  const maskedId = account.last_4_digits ? `•••• ${account.last_4_digits}` : '';

  // Calculate stats from transactions
  const transactions = transactionsData?.data || [];
  const totalIn = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalOut = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const txCount = transactions.length;

  return (
    <div className="flex h-full flex-col max-w-[1200px] mx-auto w-full pb-24 sm:pb-8">
      {/* Back Navigation */}
      <div className="px-4 py-4 sm:px-6">
        <Link 
          href="/accounts"
          className="inline-flex items-center text-small font-medium text-prism-text-muted hover:text-prism-text transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Accounts
        </Link>
      </div>

      <div className="flex-1 space-y-8 px-4 sm:px-6">
        {/* Account Hero */}
        <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${account.is_archived ? 'bg-prism-surface text-prism-text-muted' : 'bg-prism-violet-50 text-prism-violet-700'}`}>
              <Icon size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h1 font-bold text-prism-text">{account.name}</h1>
                {account.is_archived && (
                  <span className="inline-flex items-center rounded-full bg-prism-surface px-2.5 py-0.5 text-xs font-medium text-prism-text-muted border border-prism-border">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-small text-prism-text-muted mt-1">
                {TYPE_LABELS[account.type]} {maskedId && <span className="ml-1 opacity-75">{maskedId}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:items-end">
            <div className="flex flex-col sm:items-end">
              <span className="text-small font-medium text-prism-text-muted mb-1">Current Balance</span>
              <div className="text-display font-mono text-prism-text">
                {showBalance ? formatCurrency(account.current_balance) : '••••••••'}
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <PrismButton 
                variant="secondary" 
                size="compact" 
                className="flex-1 sm:flex-none"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2 size={16} className="mr-2" />
                Edit
              </PrismButton>
              {account.is_archived ? (
                <PrismButton 
                  variant="primary" 
                  size="compact" 
                  className="flex-1 sm:flex-none"
                  onClick={() => setIsRestoreModalOpen(true)}
                >
                  <ArrowUpFromLine size={16} className="mr-2" />
                  Restore
                </PrismButton>
              ) : (
                <PrismButton 
                  variant="text" 
                  size="compact" 
                  className="flex-1 sm:flex-none text-prism-danger hover:bg-prism-danger-light"
                  onClick={() => setIsArchiveModalOpen(true)}
                >
                  <Archive size={16} className="mr-2" />
                  Archive
                </PrismButton>
              )}
            </div>
          </div>
        </section>

        {/* Period Selector & Stats */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {(['today', 'week', 'month', 'custom'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-small font-medium transition-colors',
                  period === p
                    ? 'bg-prism-text text-prism-white'
                    : 'bg-prism-surface text-prism-text hover:bg-prism-elevated'
                )}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-[16px] bg-prism-surface p-4">
              <div className="flex items-center gap-2 text-small font-medium text-prism-text-muted mb-2">
                <ArrowDownToLine size={16} className="text-prism-success" />
                Total In
              </div>
              <div className="font-mono text-h3 text-prism-success">
                {showBalance ? `+${formatCurrency(totalIn.toString())}` : '••••'}
              </div>
            </div>
            
            <div className="rounded-[16px] bg-prism-surface p-4">
              <div className="flex items-center gap-2 text-small font-medium text-prism-text-muted mb-2">
                <ArrowUpFromLine size={16} className="text-prism-danger" />
                Total Out
              </div>
              <div className="font-mono text-h3 text-prism-danger">
                {showBalance ? `-${formatCurrency(totalOut.toString())}` : '••••'}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-[16px] bg-prism-surface p-4">
              <div className="flex items-center gap-2 text-small font-medium text-prism-text-muted mb-2">
                <Activity size={16} className="text-prism-violet-500" />
                Transactions
              </div>
              <div className="font-mono text-h3 text-prism-text">
                {txCount}
              </div>
            </div>
          </div>
        </section>

        {/* Transaction History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 font-semibold text-prism-text">Transaction History</h2>
            {txCount > 0 && (
              <span className="text-small text-prism-text-muted">{txCount} transactions</span>
            )}
          </div>

          <div className="rounded-[20px] bg-prism-white sm:border sm:border-prism-border overflow-hidden">
            {isLoadingTransactions ? (
              <div className="p-8 text-center text-prism-text-muted">Loading transactions...</div>
            ) : txCount > 0 ? (
              <div className="flex flex-col">
                {transactions.map(tx => (
                  <TransactionRow 
                    key={tx.id} 
                    transaction={tx} 
                    hideAccount={true} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-prism-surface text-prism-text-muted mb-4">
                  <Activity size={32} />
                </div>
                <h3 className="text-body font-medium text-prism-text mb-2">No transactions yet</h3>
                <p className="text-small text-prism-text-muted mb-6 max-w-xs">
                  This account doesn&apos;t have any transactions for the selected period.
                </p>
                <PrismButton variant="secondary">
                  Add First Transaction
                </PrismButton>
              </div>
            )}
          </div>
        </section>
      </div>

      <AccountEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        account={account} 
      />
      
      <ArchiveConfirmModal 
        isOpen={isArchiveModalOpen} 
        onClose={() => setIsArchiveModalOpen(false)} 
        account={account} 
      />

      <RestoreConfirmModal 
        isOpen={isRestoreModalOpen} 
        onClose={() => setIsRestoreModalOpen(false)} 
        account={account} 
      />
    </div>
  );
}
