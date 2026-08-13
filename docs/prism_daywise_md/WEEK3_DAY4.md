## Day 4: Dashboard UI

### Task 4.1: Dashboard Page

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md Page 01 (Dashboard) and /DESIGN_SYSTEM_v2.md.

## TASK
Build the Dashboard page with real data.

Create:
1. `apps/web/app/dashboard/page.tsx`:
   - Greeting: "Good afternoon, [Name] 👋"
   - Date + Period selector (This Month | Last Month)
   
   Stats Row (4 cards):
   - Total Balance (large, mono)
   - Income This Month (green, + arrow)
   - Spent This Month (red, − arrow)
   - Savings Rate (percentage)
   
   Primary Account Card (DarkHeroCard):
   - Account name, type, masked digits
   - Large balance
   - Card brand (if bank)
   
   Budget Health Card:
   - "₹X spent of ₹Y"
   - ProgressBar (color by percentage)
   - Days remaining
   - Daily allowance tip
   
   Accounts Panel:
   - List of 3-4 accounts with balances
   - "+ Add Account" button
   
   Recent Transactions:
   - Last 5 transactions
   - TransactionRow component
   - "View All →" link
   
   Savings Goals Section:
   - Horizontal scroll of SavingsGoalCard
   - "+ Add goal" button

2. `apps/web/components/dashboard/StatCard.tsx`:
   - SurfaceCard
   - Label (small, muted)
   - Value (h1, mono)
   - Change indicator (xs, green/red)

## CONSTRAINTS
- Use TanStack Query with 5-minute stale time
- Show skeleton loaders while loading
- Error state: "Unable to load dashboard" with retry
- Light mode only
- Amounts use JetBrains Mono
- Mobile: single column, stacked cards

## VERIFICATION
1. Dashboard loads with real data from API
2. Stats match actual transactions
3. Budget progress bar color changes by percentage
4. Recent transactions clickable → detail page
5. Savings goals animate on load
6. Test on mobile: all cards visible, scrollable
