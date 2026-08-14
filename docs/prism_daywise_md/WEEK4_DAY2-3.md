> [!CAUTION]
> **[CANCELLED]** The PWA Offline Queue feature is entirely cancelled based on updated architectural decisions. Do not implement Service Workers or offline syncing. See `docs/PLAN_OVERRIDES.md`.

Day 2-3: PWA Offline Queue
## CONTEXT
Read /FRONTEND_OPTIMIZATION_GUIDE.md Section 5 (PWA & Offline-First).

## TASK
Build offline transaction queue.

Create:
1. `apps/web/lib/offline-queue.ts`:
```typescript
interface QueuedTransaction {
  id: string; // client-generated UUID
  payload: TransactionCreatePayload;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'failed';
}

class OfflineQueue {
  private queue: QueuedTransaction[] = [];
  
  constructor() {
    this.loadFromStorage();
    window.addEventListener('online', () => this.sync());
  }
  
  async add(payload: TransactionCreatePayload): Promise<string> {
    const item: QueuedTransaction = {
      id: crypto.randomUUID(),
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };
    this.queue.push(item);
    await this.persist();
    
    if (navigator.onLine) {
      this.sync();
    }
    return item.id;
  }
  
  async sync(): Promise<void> {
    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue[0];
      try {
        await createTransactionAPI(item.payload);
        this.queue.shift();
        await this.persist();
      } catch (error) {
        item.retryCount++;
        if (item.retryCount > 3) {
          item.status = 'failed';
          // Notify user
          toast.error(`Failed to sync transaction: ${item.payload.note || 'Untitled'}`);
        }
        break;
      }
    }
  }
  
  private async persist(): Promise<void> {
    localStorage.setItem('prism_offline_queue', JSON.stringify(this.queue));
  }
  
  private loadFromStorage(): void {
    const stored = localStorage.getItem('prism_offline_queue');
    if (stored) {
      this.queue = JSON.parse(stored);
    }
  }
  
  getQueue(): QueuedTransaction[] {
    return this.queue;
  }
  
  clearFailed(): void {
    this.queue = this.queue.filter(item => item.status !== 'failed');
    this.persist();
  }
}

export const offlineQueue = new OfflineQueue();
Update QuickAddModal to use offline queue when offline:
TypeScript
const handleSave = async (data: TransactionCreatePayload) => {
  if (!navigator.onLine) {
    const id = await offlineQueue.add(data);
    toast.success('Transaction saved offline. Will sync when online.');
    // Optimistic update
    queryClient.setQueryData(['transactions'], (old: any) => ({
      ...old,
      data: [{...data, id, status: 'pending'}, ...(old?.data || [])]
    }));
    return;
  }
  // Normal online flow
  await createTransaction.mutateAsync(data);
};
Add offline indicator to UI:
Banner when offline: "You're offline. Transactions will sync when connected."
Badge on FAB showing queued count
CONSTRAINTS
Queue persisted in localStorage
Auto-sync on reconnect
Max 3 retries per item
Failed items shown to user for manual retry
Optimistic UI even when offline
VERIFICATION
Go offline → add transaction → shows in list with "pending" status
Reconnect → auto-syncs → status changes to "completed"
Failed after 3 retries → shows in failed list
Refresh page → queue persists
Multiple offline transactions → all sync in order
plain

---

