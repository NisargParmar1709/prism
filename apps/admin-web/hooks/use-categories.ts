import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_default: boolean;
  transaction_count?: number;
}

export interface CategoriesResponse {
  data: Category[];
}

export function useCategories(type?: 'income' | 'expense') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      try {
        const response = await api.get<Category[]>('/categories', {
          params: type ? { type } : undefined,
        });
        // the API returns the list directly, so response.data is Category[]
        const categories = response.data;
        // Filter out by type on frontend if backend doesn't filter
        return type ? categories.filter(c => c.type === type) : categories;
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn("Categories API not found (Week 2 feature). Returning mock defaults.");
          return [
            { id: '1', name: 'Food & Dining', icon: '🍔', color: '#F87171', type: 'expense', is_default: true },
            { id: '2', name: 'Transport', icon: '🚗', color: '#60A5FA', type: 'expense', is_default: true },
            { id: '3', name: 'Shopping', icon: '🛍️', color: '#A78BFA', type: 'expense', is_default: true },
            { id: '4', name: 'Salary', icon: '💰', color: '#34D399', type: 'income', is_default: true },
          ].filter(c => !type || c.type === type) as Category[];
        }
        throw error;
      }
    },
  });
}

export type CreateCategoryPayload = {
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
};

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryPayload) => {
      const response = await api.post<Category>('/categories', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Category created');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'Failed to create category';
      toast.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCategoryPayload> }) => {
      const response = await api.patch<Category>(`/categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Category updated');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'Failed to update category';
      toast.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success('Category deleted');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'Failed to delete category';
      toast.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Since transactions use categories
    },
  });
}
