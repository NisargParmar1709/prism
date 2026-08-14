import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  college: string | null;
  avatar_url: string | null;
  currency: string;
}

export interface NotificationPreference {
  alert_type: string;
  email: boolean;
  in_app: boolean;
}

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const res = await api.patch('/users/me', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });
}

export function useDeleteAccount() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await api.delete('/users/me');
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      // Supabase auth signout or just redirect
      router.push('/login');
    },
    onError: () => {
      toast.error('Failed to delete account');
    },
  });
}

export function useNotificationPreferences() {
  return useQuery<{ preferences: NotificationPreference[] }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/settings/notifications');
      return res.data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { preferences: NotificationPreference[] }) => {
      const res = await api.patch('/settings/notifications', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error('Failed to update notifications');
    },
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get('/export/transactions.csv', {
        responseType: 'blob', // Important for downloading files
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    },
    onSuccess: () => {
      toast.success('Download started');
    },
    onError: () => {
      toast.error('Failed to export data');
    }
  });
}
