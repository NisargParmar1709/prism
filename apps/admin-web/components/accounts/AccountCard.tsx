'use client';

import Link from 'next/link';
import { Landmark, Wallet, CreditCard, PiggyBank, ShieldAlert, CircleDollarSign } from 'lucide-react';
import { SurfaceCard } from '../ui/SurfaceCard';
import { useBalanceVisibility } from '../providers/BalanceProvider';
import { Account, AccountType } from '@/hooks/use-accounts';

interface AccountCardProps {
  account: Account;
}

const TYPE_CONFIG: Record<AccountType, { icon: React.ElementType, bg: string, color: string, label: string }> = {
  bank: { icon: Landmark, bg: 'bg-blue-50', color: 'text-blue-600', label: 'Bank Account' },
  cash: { icon: CircleDollarSign, bg: 'bg-green-50', color: 'text-green-600', label: 'Cash' },
  wallet: { icon: Wallet, bg: 'bg-purple-50', color: 'text-purple-600', label: 'Wallet' },
  fd: { icon: PiggyBank, bg: 'bg-orange-50', color: 'text-orange-600', label: 'Fixed Deposit' },
  savings: { icon: PiggyBank, bg: 'bg-teal-50', color: 'text-teal-600', label: 'Savings Goal' },
  emergency: { icon: ShieldAlert, bg: 'bg-red-50', color: 'text-red-600', label: 'Emergency Fund' },
};

const formatCurrency = (amount: string, currency: string) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export function AccountCard({ account }: AccountCardProps) {
  const { showBalance } = useBalanceVisibility();
  const config = TYPE_CONFIG[account.type] || TYPE_CONFIG.bank;
  const Icon = config.icon;
  
  const displayBalance = showBalance ? formatCurrency(account.current_balance, account.currency) : '••••••';

  return (
    <Link href={`/accounts/${account.id}`} className="block">
      <SurfaceCard className="transition-all duration-200 hover:shadow-md hover:border-[var(--prism-border-strong)] cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <h3 className="text-body font-medium text-[var(--prism-text)]">{account.name}</h3>
              <p className="text-small text-[var(--prism-text-muted)]">
                {config.label} {account.last_4_digits ? `• ••${account.last_4_digits}` : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-h3 font-mono font-semibold text-[var(--prism-text)]">
              {displayBalance}
            </div>
          </div>
        </div>
      </SurfaceCard>
    </Link>
  );
}
