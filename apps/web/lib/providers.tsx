'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Bottom-center on mobile, top-right on desktop */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--prism-white)',
            color: 'var(--prism-text)',
            border: '1px solid var(--prism-border)',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          },
          success: {
            iconTheme: {
              primary: 'var(--prism-success)',
              secondary: 'var(--prism-white)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--prism-danger)',
              secondary: 'var(--prism-white)',
            },
          },
        }}
        containerStyle={{
          bottom: 80, // Above mobile bottom nav (64px + 16px)
        }}
      />
    </QueryClientProvider>
  );
}
