import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type AccountType = 'cash' | 'bank' | 'wallet' | 'fd' | 'savings' | 'emergency';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  last_4_digits: string | null;
  opening_balance: string;
  current_balance: string;
  currency: string;
  is_archived: boolean;
  is_emergency_fund: boolean;
  emergency_target: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  last_4_digits?: string | null;
  opening_balance: string;
  is_emergency_fund?: boolean;
  emergency_target?: string | null;
}

export function useAccounts(includeArchived = false) {
  return useQuery({
    queryKey: ['accounts', { includeArchived }],
    queryFn: async () => {
      const response = await api.get<Account[]>('/accounts', {
        params: { include_archived: includeArchived },
      });
      return response.data;
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAccountInput) => {
      const response = await api.post<Account>('/accounts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useRestoreAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/accounts/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: async () => {
      const response = await api.get<Account>(`/accounts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export interface UpdateAccountInput {
  name?: string;
  opening_balance?: string;
  last_4_digits?: string | null;
  is_emergency_fund?: boolean;
  emergency_target?: string | null;
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAccountInput) => {
      const response = await api.patch<Account>(`/accounts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', id] });
    },
  });
}
