'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      // Poll for current user until SDK finishes OAuth exchange
      let user = null;
      for (let i = 0; i < 10; i++) {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          user = data.user;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Wait for api to be ready with tokens (if available)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use standard fetch without explicit token - api.ts or browser cookies will handle auth
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/proxy'}/users/me`, {
          // If the token is available in a global context or via api interceptor, it would be used here.
          // Since we can't reliably extract the raw token, we assume cookies or other mechanism will work.
        });
        
        if (res.ok) {
          const profile = await res.json();
          if (!profile.onboarding_completed) {
            router.push('/onboarding');
            return;
          }
        } else if (res.status === 404) {
          router.push('/onboarding');
          return;
        }
      } catch (e) {
        // Network error fallback
      }
      
      router.push('/dashboard');
    };

    handleRedirect();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-prism-surface">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-prism-violet-600" />
        <p className="text-prism-text-muted">Authenticating...</p>
      </div>
    </div>
  );
}
