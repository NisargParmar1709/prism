'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { useAccounts } from '@/hooks/use-accounts';
import { PrismButton } from '@/components/ui/PrismButton';

export interface FilterState {
  type?: 'income' | 'expense';
  category_id?: string;
  account_id?: string;
}

interface TransactionFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function TransactionFilters({ isOpen, onClose, filters, onFilterChange }: TransactionFiltersProps) {
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

  const handleApply = (key: keyof FilterState, value: string | undefined) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-prism-text/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar/BottomSheet Panel */}
      <div className="relative w-full md:w-80 h-full max-h-screen bg-prism-white shadow-xl flex flex-col animate-in slide-in-from-right md:slide-in-from-right sm:slide-in-from-bottom">
        
        <div className="flex items-center justify-between p-4 border-b border-prism-border">
          <h2 className="text-h3 font-semibold text-prism-text">Filters</h2>
          <button onClick={onClose} className="p-2 text-prism-text-muted hover:text-prism-text rounded-full hover:bg-prism-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Type Filter */}
          <div>
            <h3 className="text-small font-medium text-prism-text mb-3">Transaction Type</h3>
            <div className="flex bg-prism-surface p-1 rounded-input">
              <button
                onClick={() => handleApply('type', undefined)}
                className={`flex-1 py-2 text-small font-medium rounded-md transition-colors ${!filters.type ? 'bg-prism-white text-prism-text shadow-sm' : 'text-prism-text-muted'}`}
              >
                All
              </button>
              <button
                onClick={() => handleApply('type', 'expense')}
                className={`flex-1 py-2 text-small font-medium rounded-md transition-colors ${filters.type === 'expense' ? 'bg-prism-white text-prism-text shadow-sm' : 'text-prism-text-muted'}`}
              >
                Expense
              </button>
              <button
                onClick={() => handleApply('type', 'income')}
                className={`flex-1 py-2 text-small font-medium rounded-md transition-colors ${filters.type === 'income' ? 'bg-prism-white text-prism-text shadow-sm' : 'text-prism-text-muted'}`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Account Filter */}
          <div>
            <h3 className="text-small font-medium text-prism-text mb-3">Account</h3>
            <select
              value={filters.account_id || ''}
              onChange={(e) => handleApply('account_id', e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:border-prism-violet-500 outline-none"
            >
              <option value="">All Accounts</option>
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-small font-medium text-prism-text mb-3">Category</h3>
            <select
              value={filters.category_id || ''}
              onChange={(e) => handleApply('category_id', e.target.value)}
              className="w-full h-10 px-3 rounded-input border border-prism-border bg-prism-white text-body text-prism-text focus:border-prism-violet-500 outline-none"
            >
              <option value="">All Categories</option>
              {categories?.filter(c => !filters.type || c.type === filters.type).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-prism-border bg-prism-white">
          <PrismButton
            variant="primary"
            className="w-full"
            onClick={onClose}
          >
            Apply Filters
          </PrismButton>
          <PrismButton
            variant="text"
            className="w-full mt-2"
            onClick={() => {
              onFilterChange({});
              onClose();
            }}
          >
            Clear All
          </PrismButton>
        </div>

      </div>
    </div>
  );
}
