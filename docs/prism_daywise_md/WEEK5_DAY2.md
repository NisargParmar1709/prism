## Day 2: Analytics UI

### Task 2.1: Analytics Page

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md Page 06 (Analytics).

## TASK
Build the Analytics page with 3 tabs.

Create:
1. `apps/web/app/analytics/page.tsx`:
   - Header: "Analytics" + Period dropdown + Account dropdown
   - Tabs: [Overview] [Spending] [Trends]
   - Animated underline indicator for active tab

2. Overview Tab:
   - Income vs Expense grouped bar chart (6 months)
     - Green bars for income
     - Red bars for expense
     - Recharts BarChart
   - Spending Breakdown donut chart
     - Monochromatic purple (chart-1 to chart-5)
   - Top Categories list
     - Horizontal bars
     - Sorted by amount

3. Spending Tab:
   - Expandable category rows
   - Each row: Category icon | Name | Total | Percentage | ▼
   - Expanded: Transaction list for that category
   - Reuse TransactionRow component

4. Trends Tab:
   - Line chart: Daily spending
   - Current month: solid purple line
   - Previous month: dashed gray line
   - Recharts LineChart
   - Tooltip with exact amounts

5. Insufficient Data State:
   - Shown when < 7 days of transactions
   - "Come back in a few days" message

## CONSTRAINTS
- Recharts only (NOT Tremor)
- Custom Prism chart wrappers
- Monochromatic purple for donuts/pies
- Green for income, red for expense in bar charts
- Responsive: charts reflow on resize
- Loading: chart skeletons
- Light mode only

## VERIFICATION
1. All 3 tabs render correctly
2. Charts show real data from API
3. Donut chart uses purple shades only
4. Bar chart uses green/red
5. Trends line chart compares two months
6. Mobile: tabs scrollable, charts readable
