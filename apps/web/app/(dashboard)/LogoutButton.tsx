'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { PrismButton } from '@/components/ui/PrismButton';
import { signOut } from '@/lib/auth';
import toast from 'react-hot-toast';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <PrismButton
      variant="text"
      size="compact"
      leftIcon={<LogOut className="w-4 h-4" />}
      onClick={handleLogout}
    >
      Log out
    </PrismButton>
  );
}
