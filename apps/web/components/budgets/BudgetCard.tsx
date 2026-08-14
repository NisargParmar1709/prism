'use client';

import { Budget, useDeleteBudget } from '@/hooks/use-budgets';
import { MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const deleteBudget = useDeleteBudget();

  const getStatusColor = () => {
    switch (budget.status) {
      case 'over_limit': return 'bg-prism-danger';
      case 'warning': return 'bg-prism-warning';
      default: return 'bg-prism-success';
    }
  };

  const getStatusBadge = () => {
    switch (budget.status) {
      case 'over_limit': return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-prism-danger-bg text-prism-danger-text uppercase tracking-wider">Over Limit</span>;
      case 'warning': return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-prism-warning-bg text-prism-warning-text uppercase tracking-wider">Warning</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-prism-success-bg text-prism-success-text uppercase tracking-wider">Healthy</span>;
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteBudget.mutate({ id: budget.id });
    }
    setShowMenu(false);
  };

  return (
    <div className="bg-prism-white border border-prism-border rounded-card p-prism-4 shadow-card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-prism-surface flex items-center justify-center text-xl shrink-0">
            {budget.category_icon}
          </div>
          <div>
            <h3 className="font-medium text-prism-text">{budget.category_name}</h3>
            <p className="text-xs text-prism-text-muted mt-0.5">
              <span className="font-mono text-prism-text font-medium">{formatCurrency(budget.spent)}</span> / <span className="font-mono">{formatCurrency(budget.amount)}</span>
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full text-prism-text-muted hover:bg-prism-surface hover:text-prism-text transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-36 bg-prism-white border border-prism-border rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-prism-text hover:bg-prism-surface flex items-center gap-2"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(budget);
                  }}
                >
                  <Edit2 className="w-4 h-4 text-prism-text-muted" /> Edit
                </button>
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-prism-danger hover:bg-prism-danger-bg flex items-center gap-2"
                  onClick={handleDelete}
                  disabled={deleteBudget.isPending}
                >
                  <Trash2 className="w-4 h-4" /> {deleteBudget.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 bg-prism-surface rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatusColor()}`}
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium text-prism-text-secondary w-9 text-right">{budget.percentage.toFixed(0)}%</span>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        {getStatusBadge()}
        <span className="text-xs text-prism-text-muted">
          {budget.status === 'over_limit' ? 'Exceeded by ' : 'Remaining: '}
          <span className="font-mono font-medium">
            {formatCurrency(budget.status === 'over_limit' ? Math.abs(parseFloat(budget.remaining)).toString() : budget.remaining)}
          </span>
        </span>
      </div>
    </div>
  );
}
