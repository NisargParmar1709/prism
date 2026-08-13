'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useTransactions, Transaction } from '@/hooks/use-transactions';
import { TransactionRow } from '@/components/ui/TransactionRow';
import { PrismButton } from '@/components/ui/PrismButton';
import { TransactionFilters, FilterState } from '@/components/transactions/TransactionFilters';
import { QuickAddModal } from '@/components/transactions/QuickAddModal';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const { data, isLoading } = useTransactions({
    page,
    limit: 50,
    ...filters,
    search: search || undefined,
  });

  const rawTransactions = data?.data || [];
  const transactions = useMemo(() => rawTransactions, [rawTransactions]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, { date: string; net: number; items: Transaction[] }> = {};
    
    transactions.forEach(tx => {
      const dateKey = tx.date; // e.g. "2026-08-14"
      if (!groups[dateKey]) {
        groups[dateKey] = { date: dateKey, net: 0, items: [] };
      }
      
      const amount = parseFloat(tx.amount);
      groups[dateKey].net += tx.type === 'income' ? amount : -amount;
      groups[dateKey].items.push(tx);
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  // Calculate top bar summary
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      if (tx.type === 'income') income += amount;
      else expense += amount;
    });
    return { income, expense, net: income - expense };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'TODAY';
    if (isYesterday(date)) return 'YESTERDAY';
    return format(date, 'EEE, d MMMM').toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-prism-surface pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-prism-surface/80 backdrop-blur-md border-b border-prism-border p-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-h1 text-prism-text">Transactions</h1>
          <PrismButton variant="primary" size="compact" onClick={() => setIsQuickAddOpen(true)} className="hidden md:flex gap-2">
            <Plus className="w-4 h-4" /> Add
          </PrismButton>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prism-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:outline-none focus:border-prism-violet-500"
            />
          </div>
          <PrismButton variant="secondary" className="px-3 relative" onClick={() => setIsFilterOpen(true)}>
            <Filter className="w-5 h-5 text-prism-text-muted" />
            {(filters.type || filters.category_id || filters.account_id) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-prism-violet-500" />
            )}
          </PrismButton>
        </div>
      </header>

      {/* Summary Bar */}
      <div className="bg-prism-white border-b border-prism-border p-4 md:px-8 flex justify-between items-center text-small sticky top-[120px] md:top-[120px] z-[5]">
        <div className="flex flex-col">
          <span className="text-prism-text-muted">Income</span>
          <span className="font-mono text-prism-success font-semibold">+{formatCurrency(summary.income)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-prism-text-muted">Spent</span>
          <span className="font-mono text-prism-danger font-semibold">−{formatCurrency(summary.expense)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-prism-text-muted">Net</span>
          <span className={`font-mono font-semibold ${summary.net >= 0 ? 'text-prism-success' : 'text-prism-danger'}`}>
            {summary.net >= 0 ? '+' : '−'}{formatCurrency(Math.abs(summary.net))}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 md:p-8">
        {isLoading ? (
          <div className="text-center text-prism-text-muted py-10">Loading transactions...</div>
        ) : groupedTransactions.length === 0 ? (
          <div className="text-center py-20 bg-prism-white rounded-card shadow-sm border border-prism-border mt-4">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-h3 font-medium text-prism-text mb-2">No transactions yet</h3>
            <p className="text-body text-prism-text-secondary max-w-sm mx-auto mb-6">
              You haven&apos;t added any transactions for this period. Try clearing your filters or adding a new one.
            </p>
            <PrismButton variant="primary" onClick={() => setIsQuickAddOpen(true)} className="mx-auto block">
              Add Transaction
            </PrismButton>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTransactions.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-small font-medium tracking-wider text-prism-text-muted">
                    {formatDateHeader(group.date)}
                  </span>
                  <span className="text-small font-mono text-prism-text-secondary">
                    {group.net >= 0 ? '+' : '−'}{formatCurrency(Math.abs(group.net))} net
                  </span>
                </div>
                <div className="bg-prism-white rounded-card overflow-hidden shadow-sm border border-prism-border">
                  {group.items.map((tx, idx) => (
                    <TransactionRow
                      key={tx.id}
                      onClick={() => router.push(`/transactions/${tx.id}`)}
                      icon={<span className="text-xl">{tx.category_icon || '✨'}</span>}
                      title={tx.note || tx.category_name}
                      subtitle={`${tx.category_name} • ${tx.account_name}`}
                      amount={tx.type === 'income' ? parseFloat(tx.amount) : -parseFloat(tx.amount)}
                      className={idx < group.items.length - 1 ? 'border-b border-prism-border' : 'border-none'}
                    />
                  ))}
                </div>
              </div>
            ))}

            {data?.meta?.has_next && (
              <div className="text-center pt-4">
                <PrismButton variant="secondary" onClick={() => setPage(p => p + 1)}>
                  Load More
                </PrismButton>
              </div>
            )}
          </div>
        )}
      </div>

      <TransactionFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={(f) => { setFilters(f); setPage(1); }}
      />
      
      <QuickAddModal 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
}
