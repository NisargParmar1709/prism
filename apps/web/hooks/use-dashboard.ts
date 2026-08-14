'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Transaction } from '@/hooks/use-transactions';
import { Account } from '@/hooks/use-accounts';
import { SavingsGoal } from '@/hooks/use-savings-goals';

export interface BudgetHealthItem {
  id: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  amount: string;
  spent: string;
  remaining: string;
  percentage: number;
  status: string;
  period: string;
}

export interface DashboardData {
  greeting: string;
  date: string;
  period: string;
  stats: {
    total_balance: string;
    income_this_month: string;
    spent_this_month: string;
    savings_rate: number;
  };
  budget_health: {
    data: BudgetHealthItem[];
    summary: {
      total_budgeted: string;
      total_spent: string;
      total_remaining: string;
    };
  };
  accounts: Account[];
  recent_transactions: {
    data: Transaction[];
    meta: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  category_distribution: Array<{
    category_id: string;
    category_name: string;
    category_icon: string;
    amount: string;
    percentage: number;
  }>;
  savings_goals: SavingsGoal[];
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get('/dashboard');
  return response.data;
};

export function useDashboard(period?: string) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', period],
    queryFn: () => {
      let url = '/dashboard';
      if (period) {
        url += `?period=${period}`;
      }
      return api.get(url).then(res => res.data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    retry: 1
  });
}
