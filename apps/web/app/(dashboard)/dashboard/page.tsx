'use client';

import { useDashboard, DashboardData } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { SavingsGoalsSection } from '@/components/savings/SavingsGoalsSection';
import { PrismButton } from '@/components/ui/PrismButton';
import Link from 'next/link';
import { ChevronRight, CreditCard, Landmark, Wallet, ArrowRight, Plus } from 'lucide-react';
import { BalanceToggle } from '@/components/accounts/BalanceToggle';
import { useBalanceVisibility } from '@/components/providers/BalanceProvider';
import { useState } from 'react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [period, setPeriod] = useState<string>('');
  const { data: dashboard, isLoading, error, refetch } = useDashboard(period);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-prism-danger">Unable to load dashboard</p>
        <PrismButton onClick={() => refetch()} variant="outline">
          Retry
        </PrismButton>
      </div>
    );
  }

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bank': return <Landmark className="w-5 h-5 text-prism-info" />;
      case 'wallet': return <Wallet className="w-5 h-5 text-prism-violet-500" />;
      default: return <CreditCard className="w-5 h-5 text-prism-success" />;
    }
  };

  const displayAmount = (amount: string | number, prefix = '₹') => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return showBalance ? `${prefix}${val.toLocaleString('en-IN')}` : '****';
  };

  // Determine primary account
  const primaryAccount = dashboard.accounts.length > 0 ? dashboard.accounts[0] : null;

  // Calculate budget overall percentage
  const totalBudgeted = parseFloat(dashboard.budget_health.summary.total_budgeted) || 0;
  const totalSpent = parseFloat(dashboard.budget_health.summary.total_spent) || 0;
  const budgetPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  
  // Calculate days remaining in current month
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - today.getDate();
  const dailyAllowance = daysRemaining > 0 ? (totalBudgeted - totalSpent) / daysRemaining : 0;

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
          <select 
            className="h-9 px-3 text-small rounded-lg border border-prism-border bg-prism-white text-prism-text outline-none focus:border-prism-violet-500 transition-colors"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="">This Month</option>
            <option value={format(new Date(today.getFullYear(), today.getMonth() - 1, 1), 'yyyy-MM')}>Last Month</option>
          </select>
        </div>
      </div>

      {/* ─── Hero Account & Budget Health ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-prism-5">
        
        {/* Primary Account (DarkHeroCard) */}
        {primaryAccount ? (
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-card p-prism-5 shadow-[0_8px_24px_rgba(30,41,59,0.3)] text-prism-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-prism-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-prism-violet-500/20 transition-colors duration-700"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                  {getAccountIcon(primaryAccount.type)}
                </div>
                <div>
                  <h3 className="font-medium text-prism-white/90">{primaryAccount.name}</h3>
                  <p className="text-xs text-prism-white/60 capitalize">
                    {primaryAccount.type}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm text-prism-white/60 mb-1">Available Balance</p>
              <p className="text-display font-mono tracking-tight text-white">
                {displayAmount(primaryAccount.current_balance)}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-card p-prism-5 shadow-card text-prism-white flex flex-col items-center justify-center">
             <p className="text-prism-white/60 mb-4">No accounts linked</p>
             <Link href="/accounts">
               <PrismButton variant="outline" className="text-prism-white border-prism-white/20 hover:bg-white/10">Add Account</PrismButton>
             </Link>
          </div>
        )}

        {/* Budget Health Card */}
        <div className="bg-prism-white border border-prism-border rounded-card p-prism-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-h2 font-semibold text-prism-text tracking-tight">Budget Health</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                budgetPercentage >= 100 ? 'bg-prism-danger-bg text-prism-danger-text' : 
                budgetPercentage >= 80 ? 'bg-prism-warning-bg text-prism-warning-text' : 
                'bg-prism-success-bg text-prism-success-text'
              }`}>
                {budgetPercentage.toFixed(1)}% Used
              </span>
            </div>
            
            <p className="text-body text-prism-text-secondary">
              <span className="font-mono text-prism-text font-medium">{displayAmount(totalSpent)}</span> spent of <span className="font-mono">{displayAmount(totalBudgeted)}</span>
            </p>
          </div>
          
          <div className="mt-6">
            <div className="h-2 w-full bg-prism-surface rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  budgetPercentage >= 100 ? 'bg-prism-danger' : 
                  budgetPercentage >= 80 ? 'bg-prism-warning' : 
                  'bg-prism-violet-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-small text-prism-text-secondary">
              <span>{daysRemaining} days remaining</span>
              <span><span className="font-mono">{displayAmount(Math.max(0, dailyAllowance))}</span> / day</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Balance" 
          value={displayAmount(dashboard.stats.total_balance)}
          changeType="neutral"
        />
        <StatCard 
          label="Income This Month" 
          value={displayAmount(dashboard.stats.income_this_month)}
          changeType="neutral"
        />
        <StatCard 
          label="Spent This Month" 
          value={displayAmount(dashboard.stats.spent_this_month)}
          changeType="neutral"
          isInverseColors={true}
        />
        <StatCard 
          label="Savings Rate" 
          value={`${dashboard.stats.savings_rate}%`}
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
              {dashboard.recent_transactions.data.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  hideAccount={false}
                />
              ))}
              {dashboard.recent_transactions.data.length === 0 && (
                <p className="text-prism-text-muted text-center py-4">No recent transactions.</p>
              )}
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
                      {displayAmount(acc.current_balance)}
                    </p>
                  </div>
                </div>
              ))}
              {dashboard.accounts.length === 0 && (
                 <p className="text-prism-text-muted text-center py-2 text-sm">No accounts found.</p>
              )}
            </div>
            
            <Link href="/accounts">
              <PrismButton variant="outline" className="w-full mt-4" leftIcon={<Plus className="w-4 h-4" />}>
                Add Account
              </PrismButton>
            </Link>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
