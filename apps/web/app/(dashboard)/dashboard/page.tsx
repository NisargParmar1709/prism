'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { SavingsGoalsSection } from '@/components/savings/SavingsGoalsSection';
import { AccountCard } from '@/components/accounts/AccountCard';
import { PrismButton } from '@/components/ui/PrismButton';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { ChevronRight, CreditCard, Landmark, Wallet, ArrowRight, Plus } from 'lucide-react';
import { BalanceToggle } from '@/components/accounts/BalanceToggle';
import { useBalanceVisibility } from '@/components/providers/BalanceProvider';

export default function DashboardPage() {
  const { data: dashboard, isLoading, error } = useDashboard();
  const { showBalance } = useBalanceVisibility();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-prism-violet-200 border-t-prism-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-prism-danger">Failed to load dashboard data</p>
      </div>
    );
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Landmark className="w-5 h-5 text-prism-info" />;
      case 'wallet': return <Wallet className="w-5 h-5 text-prism-violet-500" />;
      default: return <CreditCard className="w-5 h-5 text-prism-success" />;
    }
  };

  const displayAmount = (amount: string, prefix = '₹') => {
    return showBalance ? `${prefix}${parseFloat(amount).toLocaleString('en-IN')}` : '****';
  };

  return (
    <div className="space-y-prism-6 animate-in fade-in duration-500">
      
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-h2 font-bold text-prism-text tracking-tight">
            {dashboard.greeting}
          </h1>
          <p className="text-small text-prism-text-muted mt-1">
            {new Date(dashboard.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <BalanceToggle />
          <select className="h-9 px-3 text-small rounded-lg border border-prism-border bg-prism-white text-prism-text outline-none focus:border-prism-violet-500 transition-colors">
            <option>This Month</option>
            <option>Last Month</option>
            <option>Custom</option>
          </select>
        </div>
      </div>

      {/* ─── Hero Account & Budget Health ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-prism-5">
        
        {/* Primary Account (DarkHeroCard) */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-card p-prism-5 shadow-[0_8px_24px_rgba(30,41,59,0.3)] text-prism-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-prism-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-prism-violet-500/20 transition-colors duration-700"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                {getAccountIcon(dashboard.primary_account.type)}
              </div>
              <div>
                <h3 className="font-medium text-prism-white/90">{dashboard.primary_account.name}</h3>
                <p className="text-xs text-prism-white/60 capitalize">
                  {dashboard.primary_account.type} •••• {dashboard.primary_account.last_4_digits}
                </p>
              </div>
            </div>
            
            {dashboard.primary_account.card_brand === 'visa' && (
              <div className="text-xl font-bold italic text-white/50">VISA</div>
            )}
          </div>
          
          <div className="relative z-10">
            <p className="text-sm text-prism-white/60 mb-1">Available Balance</p>
            <p className="text-display font-mono tracking-tight text-white">
              {displayAmount(dashboard.primary_account.balance)}
            </p>
          </div>
        </div>

        {/* Budget Health Card */}
        <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-h2 font-semibold text-prism-text tracking-tight">Budget Health</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                dashboard.budget_health.percentage >= 100 ? 'bg-prism-danger-bg text-prism-danger-text' : 
                dashboard.budget_health.percentage >= 80 ? 'bg-prism-warning-bg text-prism-warning-text' : 
                'bg-prism-success-bg text-prism-success-text'
              }`}>
                {dashboard.budget_health.percentage}% Used
              </span>
            </div>
            
            <p className="text-body text-prism-text-secondary">
              <span className="font-mono text-prism-text font-medium">{displayAmount(dashboard.budget_health.spent)}</span> spent of <span className="font-mono">{displayAmount(dashboard.budget_health.limit)}</span>
            </p>
          </div>
          
          <div className="mt-6">
            <div className="h-2 w-full bg-prism-surface rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  dashboard.budget_health.percentage >= 100 ? 'bg-prism-danger' : 
                  dashboard.budget_health.percentage >= 80 ? 'bg-prism-warning' : 
                  'bg-prism-violet-500'
                }`}
                style={{ width: `${Math.min(dashboard.budget_health.percentage, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-small text-prism-text-secondary">
              <span>{dashboard.budget_health.days_remaining} days remaining</span>
              <span><span className="font-mono">{displayAmount(dashboard.budget_health.daily_allowance)}</span> / day</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Balance" 
          value={displayAmount(dashboard.stats.total_balance)}
          change={`₹${parseFloat(dashboard.stats.balance_change).toLocaleString('en-IN')}`}
          changeType={dashboard.stats.balance_change_type}
        />
        <StatCard 
          label="Income This Month" 
          value={displayAmount(dashboard.stats.income_this_month)}
          change={`₹${parseFloat(dashboard.stats.income_change).toLocaleString('en-IN')}`}
          changeType="increase"
        />
        <StatCard 
          label="Spent This Month" 
          value={displayAmount(dashboard.stats.spent_this_month)}
          change={`₹${parseFloat(dashboard.stats.spent_change).toLocaleString('en-IN')}`}
          changeType="increase"
          isInverseColors={true}
        />
        <StatCard 
          label="Savings Rate" 
          value={`${dashboard.stats.savings_rate}%`}
          change={displayAmount(dashboard.stats.savings_amount)}
          changeType="neutral"
        />
      </div>

      {/* ─── Main Content Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-prism-5">
        
        {/* Left Column: Recent Transactions & Savings Goals (Span 2) */}
        <div className="lg:col-span-2 space-y-prism-5">
          
          {/* Recent Transactions */}
          <div className="bg-prism-white border border-prism-border rounded-card overflow-hidden shadow-card">
            <div className="px-prism-5 py-4 flex justify-between items-center border-b border-prism-border">
              <h2 className="text-h3 font-semibold text-prism-text">Recent Transactions</h2>
              <Link href="/transactions" className="text-small text-prism-violet-600 hover:text-prism-violet-700 font-medium flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="px-prism-5">
              {dashboard.recent_transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={{
                    id: tx.id,
                    account_id: 'mock-account-id',
                    account_name: tx.account,
                    account_type: 'bank',
                    category_id: 'mock-category-id',
                    category_name: tx.category,
                    category_icon: tx.category_icon,
                    type: tx.type as any,
                    amount: tx.amount,
                    date: tx.date,
                    note: tx.description,
                    tags: [],
                    status: tx.status as any,
                    payment_method: tx.payment_method,
                    created_at: tx.date,
                  }}
                  hideAccount={false}
                />
              ))}
            </div>
          </div>
          
          {/* Savings Goals */}
          <SavingsGoalsSection />
          
        </div>

        {/* Right Column: Accounts Panel & Upcoming */}
        <div className="space-y-prism-5">
          
          {/* Accounts Panel */}
          <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-h3 font-semibold text-prism-text">Accounts</h2>
              <Link href="/accounts" className="p-1 text-prism-text-muted hover:text-prism-text-secondary rounded-full hover:bg-prism-surface transition-colors">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {dashboard.accounts.map((acc) => (
                <div key={acc.id} className="flex justify-between items-center p-3 rounded-xl border border-prism-border bg-prism-surface/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-prism-white border border-prism-border flex items-center justify-center shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <p className="text-small font-medium text-prism-text truncate">{acc.name}</p>
                      <p className="text-xs text-prism-text-muted capitalize">{acc.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-small font-mono text-prism-text">
                      {displayAmount(acc.balance)}
                    </p>
                    <p className={`text-xs font-medium ${acc.change_type === 'decrease' ? 'text-prism-danger' : acc.change_type === 'increase' ? 'text-prism-success' : 'text-prism-text-muted'}`}>
                      {acc.change_type === 'decrease' ? '-' : acc.change_type === 'increase' ? '+' : ''}₹{parseFloat(acc.change).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <PrismButton variant="outline" className="w-full mt-4" leftIcon={<Plus className="w-4 h-4" />}>
              Add Account
            </PrismButton>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
