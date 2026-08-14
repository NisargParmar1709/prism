'use client';

import { useState } from 'react';
import { useBudgets } from '@/hooks/use-budgets';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { AddBudgetModal } from '@/components/budgets/AddBudgetModal';
import { EditBudgetModal } from '@/components/budgets/EditBudgetModal';
import { PrismButton } from '@/components/ui/PrismButton';
import { Plus, ChevronLeft, ChevronRight, PieChart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format, subMonths, addMonths, startOfMonth, parseISO } from 'date-fns';
import { Budget } from '@/hooks/use-budgets';

export default function BudgetsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  const period = format(currentDate, 'yyyy-MM');
  const monthName = format(currentDate, 'MMMM yyyy');
  
  const { data: budgetData, isLoading, isError, refetch } = useBudgets(period);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(prev => subMonths(startOfMonth(prev), 1));
    } else {
      setCurrentDate(prev => addMonths(startOfMonth(prev), 1));
    }
  };

  const budgets = budgetData?.data || [];
  const summary = budgetData?.summary || { total_budgeted: '0', total_spent: '0', total_remaining: '0' };
  
  const overLimitBudgets = budgets.filter(b => b.status === 'over_limit');
  const warningBudgets = budgets.filter(b => b.status === 'warning');
  const healthyBudgets = budgets.filter(b => b.status === 'healthy');

  const needsAttention = [...overLimitBudgets, ...warningBudgets];

  // Calculate overall percentage
  const totalBudgeted = parseFloat(summary.total_budgeted);
  const totalSpent = parseFloat(summary.total_spent);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  
  // Calculate days remaining in selected month
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysRemaining = Math.max(0, lastDay.getDate() - new Date().getDate());

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-prism-danger">Failed to load budgets.</p>
        <PrismButton onClick={() => refetch()} variant="outline">Retry</PrismButton>
      </div>
    );
  }

  return (
    <div className="space-y-prism-6 animate-in fade-in duration-500 pb-12">
      
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-h2 font-bold text-prism-text tracking-tight">Budgets</h1>
          
          <div className="flex items-center bg-prism-surface rounded-full border border-prism-border p-1">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-1 rounded-full text-prism-text-muted hover:text-prism-text hover:bg-prism-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-small font-medium text-prism-text w-32 text-center">
              {monthName}
            </span>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-1 rounded-full text-prism-text-muted hover:text-prism-text hover:bg-prism-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <PrismButton 
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Budget
        </PrismButton>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-prism-violet-200 border-t-prism-violet-600 rounded-full animate-spin"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] border-2 border-dashed border-prism-border rounded-card bg-prism-surface/30">
          <div className="w-16 h-16 bg-prism-violet-50 text-prism-violet-500 rounded-full flex items-center justify-center mb-4">
            <PieChart className="w-8 h-8" />
          </div>
          <h3 className="text-h3 font-semibold text-prism-text mb-2">No budgets set</h3>
          <p className="text-prism-text-muted text-center max-w-md mb-6">
            Track your spending limits by category for {monthName}.
          </p>
          <PrismButton onClick={() => setIsAddModalOpen(true)}>Create First Budget</PrismButton>
        </div>
      ) : (
        <>
          {/* ─── Overall Banner ────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-prism-violet-900 to-[#1E293B] rounded-card p-prism-5 text-prism-white shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-prism-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="text-sm text-prism-white/70 font-medium mb-1">Overall Monthly Budget</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-display font-mono font-semibold">{formatCurrency(summary.total_spent)}</span>
                  <span className="text-h3 font-mono text-prism-white/50 font-normal">/ {formatCurrency(summary.total_budgeted)}</span>
                </div>
              </div>
              
              <div className="w-full md:w-1/3 min-w-[200px]">
                <div className="flex justify-between items-center text-sm font-medium text-prism-white/80 mb-2">
                  <span>{daysRemaining} days left</span>
                  <span>{overallPercentage.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      overallPercentage >= 100 ? 'bg-prism-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 
                      overallPercentage >= 80 ? 'bg-amber-400' : 
                      'bg-prism-success'
                    }`}
                    style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Needs Attention ───────────────────────────────────────────────── */}
          {needsAttention.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-h3 font-semibold text-prism-text border-b border-prism-border pb-2">Needs Attention</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-prism-5">
                {needsAttention.map(budget => (
                  <BudgetCard key={budget.id} budget={budget} onEdit={setEditingBudget} />
                ))}
              </div>
            </div>
          )}

          {/* ─── On Track ──────────────────────────────────────────────────────── */}
          {healthyBudgets.length > 0 && (
            <div className="space-y-4 mt-8">
              <h2 className="text-h3 font-semibold text-prism-text border-b border-prism-border pb-2">On Track</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-prism-5">
                {healthyBudgets.map(budget => (
                  <BudgetCard key={budget.id} budget={budget} onEdit={setEditingBudget} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      <AddBudgetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        period={period}
      />

      <EditBudgetModal 
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        budget={editingBudget}
      />
    </div>
  );
}
