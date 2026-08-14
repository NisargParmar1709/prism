# FRONTEND_OPTIMIZATION_GUIDE.md
## India-Optimized Deployment Strategy for Prism

> **The Problem:** Your users are in India. Your backend is in US/EU (InsForge free tier). Your frontend must bridge this gap intelligently.
> **The Solution:** Vercel + aggressive caching + offline-first + optimistic UI.

---

## Executive Decision: Vercel Hobby (Confirmed)

After evaluating all options, **Vercel Hobby is the correct choice** for Prism.

### Why Not Cloudflare Pages / Netlify / Others?

| Platform | India Static | India Functions | Next.js App Router | Image Opt | DX |
|----------|-------------|-----------------|-------------------|-----------|-----|
| **Vercel Hobby** | ✅ Mumbai CDN POP | ✅ sin1 (Singapore) | ✅ Native | ✅ Built-in | ✅ Best |
| Cloudflare Pages | ✅ Excellent | ✅ Edge workers | ⚠️ Experimental | ❌ Manual | ⚠️ Complex |
| Netlify | ✅ Good | ✅ Singapore | ⚠️ Limited SSR | ❌ Manual | ⚠️ Okay |
| Render | ❌ No India POP | ❌ US only | ✅ Good | ❌ Manual | ⚠️ Okay |
| InsForge Site Deploy | ✅ Edge | ❌ Static only | ❌ No SSR | ❌ No | ❌ Wrong tool |

**Verdict:** Vercel's Next.js integration is unbeatable. The 200-300ms Hop 2 (Vercel→InsForge) is structural and acceptable for a finance app used a few times per day. We optimize around it.

---

## 1. Vercel Configuration

### `vercel.json`
```json
{
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "crons": [
    {
      "path": "/api/cron/keep-warm",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Why `sin1` (Singapore):**
- Closest APAC region to India on Vercel's free tier
- ~50-80ms from major Indian cities
- No India region available on Hobby plan

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Partial Prerendering (Next.js 14+)
  experimental: {
    ppr: true,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.insforge.dev',
      },
    ],
  },

  // Compression
  compress: true,

  // Trailing slashes for consistency
  trailingSlash: false,

  // Strict mode for development quality
  reactStrictMode: true,

  // SWC minification (faster builds)
  swcMinify: true,

  // Modularize imports for tree-shaking
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    'recharts': {
      transform: 'recharts/es6/{{member}}',
    },
  },
};

module.exports = nextConfig;
```

---

## 2. Partial Prerendering (PPR) Strategy

PPR is the single most important Next.js 14 feature for Prism. It renders a static shell instantly, then streams dynamic content.

### How PPR Works for Prism

```
User requests /dashboard
  ↓
Next.js serves pre-rendered static shell (< 100ms)
  ↓
User sees layout, skeletons, cached data immediately
  ↓
Dynamic data (balance, transactions) streams in
  ↓
Skeletons replaced with real data as it arrives
```

### Implementation

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { BudgetRings } from '@/components/dashboard/BudgetRings';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AISummary } from '@/components/dashboard/AISummary';

// Static shell renders immediately
export default function DashboardPage() {
  return (
    <DashboardShell>
      {/* Static: renders instantly */}
      <h1>Dashboard</h1>

      {/* Dynamic: streams when ready */}
      <Suspense fallback={<BalanceCardSkeleton />}>
        <BalanceCard />
      </Suspense>

      <Suspense fallback={<BudgetRingsSkeleton />}>
        <BudgetRings />
      </Suspense>

      <Suspense fallback={<TransactionsSkeleton />}>
        <RecentTransactions />
      </Suspense>

      {/* AI: lowest priority, streams last */}
      <Suspense fallback={<AISummarySkeleton />}>
        <AISummary />
      </Suspense>
    </DashboardShell>
  );
}
```

### Skeleton Components

```tsx
// components/skeletons/BalanceCardSkeleton.tsx
export function BalanceCardSkeleton() {
  return (
    <div className="prism-card animate-pulse">
      <div className="h-4 w-24 bg-prism-border rounded mb-2" />
      <div className="h-10 w-40 bg-prism-border rounded" />
      <div className="h-3 w-32 bg-prism-border rounded mt-2" />
    </div>
  );
}
```

---

## 3. React Query Configuration (TanStack Query v5)

```tsx
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: data considered fresh for 5 minutes
      // Reduces API calls for dashboard data
      staleTime: 1000 * 60 * 5, // 5 minutes

      // Cache time: keep in cache for 30 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes

      // Retry failed requests 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (user returns to app)
      refetchOnWindowFocus: true,

      // Refetch on reconnect (network restored)
      refetchOnReconnect: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,

      // Error handling
      throwOnError: false,
    },
    mutations: {
      // Retry mutations once (network blip)
      retry: 1,
    },
  },
});
```

### Query Key Convention

```typescript
// Consistent query keys for cache invalidation
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  accounts: ['accounts'] as const,
  account: (id: string) => ['accounts', id] as const,
  transactions: (filters?: object) => ['transactions', filters] as const,
  transaction: (id: string) => ['transactions', id] as const,
  budgets: (period?: string) => ['budgets', period] as const,
  categories: ['categories'] as const,
  notifications: ['notifications'] as const,
  analytics: (period: string) => ['analytics', period] as const,
};
```

---

## 4. Optimistic UI Strategy

For the "under 10 seconds" quick-add requirement, optimistic updates are mandatory.

```tsx
// hooks/use-create-transaction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransactionAPI,

    // Optimistic update
    onMutate: async (newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions() });
      await queryClient.cancelQueries({ queryKey: queryKeys.dashboard });
      await queryClient.cancelQueries({ queryKey: queryKeys.accounts });

      // Snapshot previous values
      const previousTransactions = queryClient.getQueryData(queryKeys.transactions());
      const previousDashboard = queryClient.getQueryData(queryKeys.dashboard);

      // Optimistically update transactions list
      queryClient.setQueryData(queryKeys.transactions(), (old: any) => ({
        ...old,
        data: [newTransaction, ...(old?.data || [])],
      }));

      // Optimistically update dashboard
      queryClient.setQueryData(queryKeys.dashboard, (old: any) => ({
        ...old,
        total_balance: calculateNewBalance(old, newTransaction),
        recent_transactions: [newTransaction, ...(old?.recent_transactions || [])].slice(0, 5),
      }));

      return { previousTransactions, previousDashboard };
    },

    // Rollback on error
    onError: (err, newTransaction, context) => {
      queryClient.setQueryData(queryKeys.transactions(), context?.previousTransactions);
      queryClient.setQueryData(queryKeys.dashboard(), context?.previousDashboard);

      // Show error toast
      toast.error('Failed to save transaction. Please try again.');
    },

    // Refetch after mutation (in background)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
    },
  });
}
```

---

## 5. PWA & Offline-First Strategy

> [!CAUTION]
> **[CANCELLED]** The PWA Offline Queue feature is entirely cancelled based on updated architectural decisions. Do not implement Service Workers or offline syncing. See `docs/PLAN_OVERRIDES.md`.

### Service Worker Strategy (using `next-pwa`)

```javascript
// next.config.js (add to existing)
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',

  runtimeCaching: [
    {
      // Cache API responses for offline use
      urlPattern: /^https:\/\/.*\.insforge\.dev\/api\/v1\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        networkTimeoutSeconds: 3,
      },
    },
    {
      // Cache static assets aggressively
      urlPattern: /\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      // Cache images
      urlPattern: /\/_next\/image\?.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);
```

### Offline Transaction Queue

```tsx
// lib/offline-queue.ts
interface QueuedTransaction {
  id: string; // client-generated UUID
  payload: TransactionCreatePayload;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  private queue: QueuedTransaction[] = [];

  async add(payload: TransactionCreatePayload) {
    const item: QueuedTransaction = {
      id: crypto.randomUUID(),
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(item);
    await this.persist();

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.sync();
    }
  }

  async sync() {
    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue[0];
      try {
        await createTransactionAPI(item.payload);
        this.queue.shift();
        await this.persist();
      } catch (error) {
        item.retryCount++;
        if (item.retryCount > 3) {
          // Move to failed, notify user
          this.queue.shift();
        }
        break;
      }
    }
  }

  private async persist() {
    localStorage.setItem('prism_offline_queue', JSON.stringify(this.queue));
  }
}

export const offlineQueue = new OfflineQueue();

// Listen for online event
window.addEventListener('online', () => offlineQueue.sync());
```

---

## 6. Dynamic Loading & Code Splitting

```tsx
// app/analytics/page.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Heavy chart components load only when user visits analytics
const SpendingChart = dynamic(
  () => import('@/components/analytics/SpendingChart'),
  { 
    ssr: false, // Charts don't need SSR
    loading: () => <ChartSkeleton />,
  }
);

const CategoryBreakdown = dynamic(
  () => import('@/components/analytics/CategoryBreakdown'),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <Suspense fallback={<PageSkeleton />}>
        <SpendingChart />
        <CategoryBreakdown />
      </Suspense>
    </div>
  );
}
```

---

## 7. Image Optimization

```tsx
// Use Next.js Image component for all images
import Image from 'next/image';

// Avatar component
<Image
  src={user.avatar || '/default-avatar.png'}
  alt={`${user.name}'s avatar`}
  width={48}
  height={48}
  className="rounded-full"
  priority={false} // Only priority for above-fold images
/>

// Category icons (if using SVG, inline them for zero HTTP request)
// If using emoji, no image needed — zero cost
```

---

## 8. Route Prefetching

```tsx
// components/navigation/NavLink.tsx
import Link from 'next/link';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      prefetch={true} // Prefetch on hover (default in Next.js 14)
      className="nav-link"
    >
      {children}
    </Link>
  );
}
```

---

## 9. Keep-Warm Strategy

Since InsForge Compute pauses after ~7 days of inactivity:

```tsx
// app/api/cron/keep-warm/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Ping the backend health endpoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json({ status: 'backend_cold' }, { status: 503 });
  }

  return NextResponse.json({ status: 'warm', timestamp: new Date().toISOString() });
}
```

**Also use UptimeRobot (free):**
- Monitor: `https://your-backend.insforge.dev/health`
- Interval: Every 5 minutes
- This keeps the InsForge instance warm AND alerts you if it's down

---

## 10. Performance Budgets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Total Bundle Size | < 200KB (initial) | webpack-bundle-analyzer |
| API Response (cached) | < 100ms | Vercel Analytics |
| API Response (uncached) | < 400ms | Vercel Analytics |

---

## 11. Monitoring

### Vercel Analytics (Built-in, free)
- Enable in Vercel dashboard
- Tracks Web Vitals automatically
- No code needed

### Custom Performance Marks

```tsx
// lib/performance.ts
export function markStart(name: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${name}-start`);
  }
}

export function markEnd(name: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }
}

// Usage in component
useEffect(() => {
  markStart('dashboard-load');
  return () => markEnd('dashboard-load');
}, []);
```
