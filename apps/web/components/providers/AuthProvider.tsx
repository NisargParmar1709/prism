'use client';

import { useEffect } from 'react';
import { insforge } from '@/lib/insforge';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Subscribe to auth state changes from the InsForge SDK
    const unsubscribe = insforge.auth.onAuthStateChange(async (event) => {
      
      // When the user signs in or their token refreshes, sync it to our Next.js backend
      if (event === 'signedIn' || event === 'tokenRefreshed') {
        try {
          // The InsForge TokenManager keeps the actual access token in memory.
          // We extract it here to pass to our API route.
          const token = (insforge.auth as any).tokenManager?.getAccessToken?.();
          
          if (token) {
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken: token }),
            });
          }
        } catch (error) {
          console.error('Failed to sync auth session:', error);
        }
      }
      
      // When the user signs out, clear our Next.js backend session
      if (event === 'signedOut') {
        try {
          await fetch('/api/auth/session', {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Failed to clear auth session:', error);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
