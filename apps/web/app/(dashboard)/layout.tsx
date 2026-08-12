import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('prism-auth-token')?.value;

  if (token) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const backendUrl = apiUrl.startsWith('http') ? apiUrl : 'http://localhost:8000';
      
      const res = await fetch(`${backendUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const profile = await res.json();
        if (!profile.onboarding_completed) {
          redirect('/onboarding');
        }
      } else if (res.status === 404) {
        // Profile not created yet -> needs onboarding
        redirect('/onboarding');
      }
    } catch (e) {
      console.error('Failed to verify onboarding status:', e);
    }
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
