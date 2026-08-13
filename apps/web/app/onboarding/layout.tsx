import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('prism-auth-token')?.value;

  let shouldRedirectToDashboard = false;

  if (token) {
    try {
      const backendUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      
      const res = await fetch(`${backendUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const profile = await res.json();
        if (profile.onboarding_completed) {
          shouldRedirectToDashboard = true;
        }
      }
    } catch (e) {
      console.error('Failed to verify onboarding status:', e);
    }
  } else {
    redirect('/login');
  }

  if (shouldRedirectToDashboard) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
