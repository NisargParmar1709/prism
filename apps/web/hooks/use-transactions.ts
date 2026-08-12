import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

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
