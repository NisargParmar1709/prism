import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export interface RecurringRule {
  id: string;
  account_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string | null;
  note?: string;
  is_active: boolean;
  next_run: string;
  created_at: string;
}

export type CreateRecurringRulePayload = Omit<RecurringRule, 'id' | 'next_run' | 'created_at' | 'is_active'>;

export interface Transaction {
  id: string;
  account_id: string;
  account_name: string;
  account_type: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  type: 'income' | 'expense';
  amount: string;
  date: string;
  note: string;
  tags: string[];
  status: 'completed' | 'pending';
  payment_method: string;
  created_at: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface TransactionsParams {
  account_id?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export function useTransactions(params: TransactionsParams = {}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      try {
        const response = await api.get<PaginatedTransactions>('/transactions', {
          params,
        });
        return response.data;
      } catch (error: any) {
        // Fallback for Week 1 where /transactions is not yet implemented
        if (error.response?.status === 404) {
          console.warn("Transactions API not found (Week 2 feature). Returning mock empty list.");
          return {
            data: [],
            meta: {
              page: params.page || 1,
              limit: params.limit || 20,
              total: 0,
              total_pages: 0,
              has_next: false,
              has_prev: false,
            },
          } as PaginatedTransactions;
        }
        throw error;
      }
    },
  });
}

export type CreateTransactionPayload = {
  account_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: number | string;
  date: string;
  note?: string;
  tags?: string[];
  status?: 'completed' | 'pending';
  payment_method?: string;
};

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionPayload) => {
      const response = await api.post<Transaction>('/transactions', data);
      return response.data;
    },
    onMutate: async (newTx) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData(['transactions']);

      // Optimistically update
      // Since it's a paginated list with various filters, optimistic updates across all queries is hard.
      // But we can try to prepend to the first page of the default query.
      queryClient.setQueriesData({ queryKey: ['transactions'] }, (old: any) => {
        if (!old || !old.data) return old;
        // Construct a temporary transaction
        const tempTx: Transaction = {
          id: `temp-${Date.now()}`,
          ...newTx,
          amount: newTx.amount.toString(),
          tags: newTx.tags || [],
          status: newTx.status || 'completed',
          payment_method: newTx.payment_method || '',
          account_name: 'Loading...', // Ideally we'd get this from local cache
          account_type: 'bank',
          category_name: 'Loading...',
          category_icon: '✨',
          created_at: new Date().toISOString(),
        } as Transaction;

        return {
          ...old,
          data: [tempTx, ...old.data],
        };
      });

      return { previousTransactions };
    },
    onError: (err, newTx, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData({ queryKey: ['transactions'] }, context.previousTransactions);
      }
      toast.error('Failed to create transaction');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is correct
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const response = await api.get<Transaction>(`/transactions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useRestoreTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<Transaction>(`/transactions/${id}/restore`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Transaction restored');
    },
    onError: () => {
      toast.error('Failed to restore transaction');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTransactionPayload> }) => {
      const response = await api.patch<Transaction>(`/transactions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Transaction updated');
    },
    onError: () => {
      toast.error('Failed to update transaction');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);

      // Optimistically remove
      queryClient.setQueriesData({ queryKey: ['transactions'] }, (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.filter((t: Transaction) => t.id !== id),
        };
      });

      toast.success('Transaction deleted', {
        id: `delete-${id}`,
        // Undo functionality would go here if backend supported immediate restore
      });

      return { previousTransactions };
    },
    onError: (err, id, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueriesData({ queryKey: ['transactions'] }, context.previousTransactions);
      }
      toast.error('Failed to delete transaction');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useCreateRecurringRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRecurringRulePayload) => {
      const response = await api.post<RecurringRule>('/recurring-rules', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Recurring rule created');
    },
    onError: () => {
      toast.error('Failed to create recurring rule');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] });
    },
  });
}
