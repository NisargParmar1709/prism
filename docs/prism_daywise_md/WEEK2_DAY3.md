## Day 3: Quick-Add & Transaction UI

### Task 3.1: QuickAddModal Component

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md "QuickAddModal" section and /DESIGN_SYSTEM_v2.md.

## TASK
Build the QuickAddModal — the fastest way to log a transaction (< 10 seconds target).

Create:
1. `apps/web/components/transactions/QuickAddModal.tsx`:
   - Triggered by: FAB click, keyboard "N", "+ Add" buttons
   - Desktop: Centered modal (max-width 480px)
   - Mobile: Bottom sheet (slides up from bottom)
   
   Fields:
   - Type toggle: Expense | Income (default: Expense)
   - Amount: AmountInput component (₹ prefix, large, right-aligned)
   - Category: Horizontal scroll of chips (emoji + name), default to most used
   - Account: Dropdown (pre-select primary account)
   - Note: Optional text input
   - Date: Default today, clickable to change
   
   Actions:
   - [Save] Primary button
   - [Save & Add Another] Secondary button
   - [Cancel] Ghost button
   
   Target: Default-category expense in < 10 seconds (Amount → Category chip → Save)

2. `apps/web/hooks/use-transactions.ts`:
   - useCreateTransaction() with optimistic update
   - useUpdateTransaction()
   - useDeleteTransaction() with undo toast

## CONSTRAINTS
- Optimistic UI: Transaction appears immediately, syncs in background
- If API fails: Rollback with error toast
- Amount must be > 0
- Category chips show emoji + name
- Mobile: Bottom sheet with drag-to-dismiss
- Light mode only

## VERIFICATION
1. Open QuickAdd → type amount → tap category → tap Save → transaction appears instantly
2. Dashboard updates optimistically
3. If API fails → transaction removed, error toast shown
4. "Save & Add Another" keeps modal open, clears amount
5. Test on mobile: < 10 seconds for default expense
Task 3.2: Transactions Page
AntiGravity Prompt:
Markdown
Copy
Code
Preview
## CONTEXT
Read /PAGES_SPEC.md Page 02 (Transactions).

## TASK
Build the Transactions page.

Create:
1. `apps/web/app/transactions/page.tsx`:
   - Header: "Transactions" + Search + "+ Add" button
   - Period selector: Today | This Week | This Month | Custom
   - Summary bar: Income (+₹X) | Spent (−₹Y) | Net (sticky on scroll)
   - Date grouping: "MON, 23 JUNE — ₹225 net"
   - Transaction list: Reuse TransactionRow component
   - Filter panel (desktop: right slide | mobile: bottom sheet)
   - Load more / Infinite scroll

2. `apps/web/components/transactions/TransactionRow.tsx`:
   - Layout: [40px icon] | [Description + Category·Account] | [Amount] | [Status]
   - Icon: Category emoji in tinted circle
   - Amount: Right-aligned, mono, green for income, red for expense
   - Status pill: Completed (green) | Pending (amber)
   - Mobile swipe: Left swipe → Edit/Delete actions

3. `apps/web/components/transactions/TransactionFilters.tsx`:
   - Category multi-select
   - Account multi-select
   - Date range picker
   - Type (Income/Expense)
   - Amount range slider

## CONSTRAINTS
- Reuse SurfaceCard, StatusPill, AmountInput from base components
- Date grouping by day with net calculation
- Search highlights matching text
- Empty state when no transactions
- Light mode only

## VERIFICATION
1. List shows transactions grouped by date
2. Search filters in real-time
3. Filter panel works on mobile and desktop
4. Swipe actions work on mobile
5. Empty state shows for new users
