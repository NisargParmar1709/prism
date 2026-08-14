'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Budget {
  id: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  amount: string;
  spent: string;
  remaining: string;
  percentage: number;
  status: 'healthy' | 'warning' | 'over_limit';
  period: string;
}

export interface BudgetSummary {
  total_budgeted: string;
  total_spent: string;
  total_remaining: string;
}

export interface BudgetsResponse {
  data: Budget[];
  summary: BudgetSummary;
}

export interface BudgetCreate {
  category_id: string;
  amount: number | string;
  period: string;
}

export function useBudgets(period: string) {
  return useQuery<BudgetsResponse>({
    queryKey: ['budgets', period],
    queryFn: async () => {
      const response = await api.get(`/budgets?period=${period}`);
      return response.data;
    },
    enabled: !!period,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: BudgetCreate) => {
      const response = await api.post('/budgets', {
        ...data,
        amount: Number(data.amount) // ensure it's a number/decimal
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.period] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await api.delete(`/budgets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number | string }) => {
      const response = await api.put(`/budgets/${id}`, {
        amount: Number(amount)
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}
