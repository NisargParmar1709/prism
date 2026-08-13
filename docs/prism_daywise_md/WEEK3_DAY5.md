Day 5: Budgets Page & Polish
Task 5.1: Budgets Page
AntiGravity Prompt:
Markdown
Copy
Code
Preview
## CONTEXT
Read /PAGES_SPEC.md Page 05 (Budgets).

## TASK
Build the Budgets page.

Create:
1. `apps/web/app/budgets/page.tsx`:
   - Header: "Budgets" + Month navigator (← →) + "+ Add" button
   - Overall Budget Banner:
     - Total spent / Total limit
     - ProgressBar
     - Days remaining
   
   Needs Attention Section:
   - Over-limit budgets first
   - Red styling
   - "₹X over limit"
   
   On Track Section:
   - Remaining budgets
   - Color by percentage (green <80%, amber 80-99%)
   
   Budget Card:
   - Category icon + name
   - Spent / Limit
   - ProgressBar
   - Percentage
   - Status pill
   - [View transactions] [Edit limit]

2. `apps/web/components/budgets/BudgetCard.tsx`:
   - SurfaceCard
   - Icon (40px, category color)
   - Name + Spent/Limit
   - ProgressBar (8px, color-coded)
   - Status pill (healthy/warning/over_limit)

3. `apps/web/components/budgets/AddBudgetModal.tsx`:
   - Category dropdown
   - Amount input (₹)
   - Period auto-set to current month
   - [Set Budget] button

## CONSTRAINTS
- Month navigator changes period
- Budgets fetched for selected period
- Cannot create duplicate budget for category+period
- Mobile: full-width cards, stacked
- Light mode only

## VERIFICATION
1. Budgets page shows all budgets for current month
2. Over-limit budgets in "Needs Attention"
3. Click month → budgets update
4. Add budget → appears in list
5. Progress bar colors correct
6. Mobile: scrollable, readable
Week 3 Exit Gate Checklist
[ ] CORS fixed — no wildcard, explicit origins
[ ] Admin auth separated from user auth
[ ] Request ID in all responses
[ ] Budget CRUD: create, read, delete
[ ] Budget alerts at 80% and 100%
[ ] Notification system: create, read, mark read
[ ] Dashboard API returns complete aggregated data
[ ] Dashboard UI shows real data with skeletons
[ ] Budgets page with month navigation
[ ] Stats cards show correct numbers
[ ] Mobile responsive on all pages
[ ] RLS on budgets and notifications tables
plain

---

