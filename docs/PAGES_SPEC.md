# PAGES_SPEC.md
## Prism — Complete Page Specifications (Wireframe-Aligned)

> **Source:** Wireframes & text specs dated 2026-08-11
> **Total Pages:** 11
> **Scope Note:** Some pages marked as v1.1 or v2 per PRD phasing. v1 = MVP core.

---

## PAGE 01 — DASHBOARD
**Route:** `/dashboard`  
**Complexity:** ⭐⭐⭐⭐☆ (High)  
**Phase:** v1 (MVP — Core)  
**Purpose:** Financial command center. User understands their situation in 5–10 seconds.

### Layout Structure (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (240px) │  Main Content Area                        │
│                  │                                           │
│  [Logo]          │  "Good afternoon, Rahul 👋"                │
│  Dashboard       │  "30 July 2026"                          │
│  Transactions    │  [Copy A/C] [July 2026 ▼] [Statement ↓]  │
│  Accounts        │                                           │
│  Budgets         │  ┌────────────┐ ┌────────────┐ ┌────────┐ │
│  Analytics       │  │ HDFC Card  │ │Budget      │ │Category│ │
│  Assistant       │  │ ₹2,84,350  │ │Health      │ │Distrib │ │
│  Groups          │  │ ****4821   │ │67%         │ │₹35.2K  │ │
│  Settings        │  └────────────┘ └────────────┘ └────────┘ │
│                  │                                           │
│                  │  ANALYTICS                                │
│                  │  ┌────────────────────────┐ ┌────────┐ │
│                  │  │ Spending Overview        │ │Accounts│ │
│                  │  │ [Line chart]             │ │List    │ │
│                  │  │ Daily/Weekly/Monthly     │ │+Add    │ │
│                  │  └────────────────────────┘ └────────┘ │
│                  │                                           │
│                  │  ACTIVITY                                 │
│                  │  Recent Transactions [10 THIS MONTH]    │
│                  │  [All] [Food] [Transport] [Shopping] ... │
│                  │  ┌──────────────────────────────────────┐ │
│                  │  │ DATE │ DESC      │ ACCOUNT │TYPE│AMT│ │
│                  │  │ 28Jul│ Swiggy    │ HDFC    │UPI │-450│ │
│                  │  │ 27Jul│ Ola Cabs  │ HDFC    │UPI │-320│ │
│                  │  └──────────────────────────────────────┘ │
│                  │                                           │
│                  │  COMMITMENTS                              │
│                  │  ┌──────────────┐ ┌────────────────────┐ │
│                  │  │ Split Bills  │ │ Upcoming           │ │
│                  │  │ Goa Trip     │ │ Netflix ₹649       │ │
│                  │  │ Flat Expenses│ │ BESCOM ₹2,400      │ │
│                  │  │ +₹800 owed   │ │ HDFC FD ₹50K       │ │
│                  │  └──────────────┘ └────────────────────┘ │
│                  │                                           │
│                  │  Savings Goals                            │
│                  │  ┌────────┐ ┌────────┐ ┌────────┐        │
│                  │  │Emerg   │ │Goa     │ │MacBook │        │
│                  │  │62%     │ │44%     │ │31%     │        │
│                  │  │₹1.85L  │ │₹22K   │ │₹40K   │        │
│                  │  └────────┘ └────────┘ └────────┘        │
│                  │                                           │
│                  │         [ + ]  ← QuickAddFAB              │
└─────────────────────────────────────────────────────────────┘
```

### Key Components
1. **Greeting Header** — "Good [time], [Name] 👋" + date + period selector + action buttons
2. **Account Hero Card** — Dark gradient card showing primary account balance, masked number, card type
3. **Budget Health Card** — "₹X spent of ₹Y", percentage, progress bar, days remaining, daily allowance tip
4. **Category Distribution** — Donut chart (monochromatic purple), center shows total, legend right
5. **Spending Overview** — Line chart (income vs expense), period toggle (Daily/Weekly/Monthly)
6. **All Accounts Panel** — List of accounts with balance + delta, "+ Add Account" button
7. **Recent Transactions Table** — Filter chips (All, Food, Transport...), table with Date/Description/Account/Type/Amount
8. **Split Bills Card** — Group name, member count, your balance (positive = green "owed to you", negative = red "you owe")
9. **Upcoming Card** — Recurring bills + FD maturity with due dates
10. **Savings Goals** — Circular progress rings (3 cards), percentage center, amount saved below, monthly contribution bar

### States
- **Populated:** All data loaded, charts rendered
- **Loading:** Skeleton cards for stats, shimmer for table, spinner for charts
- **Empty (new user):** "Welcome to Prism" empty state with "Add your first account" CTA
- **Hidden balances:** Eye icon toggles all amounts to "****"

### Data Requirements
- GET /dashboard (aggregated summary)
- GET /accounts (list with balances)
- GET /transactions?limit=10 (recent)
- GET /budgets?period=current (budget health)
- GET /analytics/spending?period=month (chart data)
- GET /groups (summary for split bills)
- GET /recurring-rules/upcoming (upcoming commitments)
- GET /savings-goals (goal progress)

---

## PAGE 02 — TRANSACTIONS
**Route:** `/transactions`  
**Complexity:** ⭐⭐⭐⭐⭐ (Very High)  
**Phase:** v1 (MVP — Core)  
**Purpose:** Complete searchable, filterable transaction workspace.

### Layout
```
┌─────────────────────────────────────────────┐
│  Transactions          [🔍 Search] [+ Add]  │
│                                             │
│  Period: [Today] [Week] [Month] [Custom ▼]  │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │ Income: +₹8,000  Spent: −₹12,800      │ │
│  │ Net: −₹4,800                          │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  MON, 23 JUNE        −₹225 net             │
│  ┌─────────────────────────────────────────┐ │
│  │ 🍕 Zomato          HDFC Savings  −₹640│ │
│  │ Food & Dining      UPI           Completed│
│  │ 15 Jun  2:34 PM                       │ │
│  ├─────────────────────────────────────────┤ │
│  │ 🚌 Metro           Cash Wallet   −₹50 │ │
│  │ Transport                            │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  SUN, 22 JUNE        +₹5,000 net           │
│  ┌─────────────────────────────────────────┐ │
│  │ 💰 Salary          Axis Salary   +₹95K│ │
│  │ Income           NEFT          Completed│
│  └─────────────────────────────────────────┘ │
│                                             │
│  [Load more...]                             │
└─────────────────────────────────────────────┘
```

### Key Components
1. **Header** — Title + Search input + "+ Add Expense" button
2. **Period Selector** — Today / This Week / This Month / Custom (date picker)
3. **Summary Bar** — Income total, Spent total, Net (compact, sticky on scroll)
4. **Date Grouping** — Transactions grouped by date, header shows date + net for that day
5. **Transaction Row** — Icon (40px circle, category-tinted) | Description + Category·Account | Date·Time | Amount | Status pill
6. **Search** — Real-time filtering on description, category, tags. Highlight matching text.
7. **Filter Panel** — Desktop: right-side slide panel. Mobile: bottom sheet.
   - Category multi-select
   - Account multi-select
   - Date range picker
   - Type (Income/Expense)
   - Amount range
8. **Mobile Swipe** — Swipe left reveals Edit/Delete actions
9. **Load More** — Infinite scroll or "Load more" button

### States
- No transactions (new user)
- No filter results (show "No transactions match your filters" + "Clear all")
- No search results (show "No results for 'xyz'" + suggestions)
- Loading (skeleton rows)
- Delete confirmation (modal)
- Edit state (navigate to edit or inline)

### Data Requirements
- GET /transactions (paginated, filterable)
- GET /categories (for filter)
- GET /accounts (for filter)
- DELETE /transactions/{id}
- PATCH /transactions/{id}

---

## PAGE 03 — ACCOUNTS
**Route:** `/accounts`  
**Complexity:** ⭐⭐⭐☆☆ (Medium)  
**Phase:** v1 (MVP — Core)  
**Purpose:** View all financial containers and their balances.

### Layout
```
┌─────────────────────────────────────────────┐
│  Accounts                    [+ Add Account]│
│                                             │
│  Total across all accounts                  │
│  ₹44,320                          [👁 toggle]│
│                                             │
│  ACTIVE ACCOUNTS                            │
│  ┌─────────────────────────────────────────┐ │
│  │ 🏦 HDFC Savings    Bank    ••4821  ₹32,400│ │
│  │ 📱 PhonePe         UPI           ₹4,200 │ │
│  │ 💵 Cash Wallet     Cash          ₹7,720 │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  SAVINGS & GOALS                            │
│  Emergency Fund                             │
│  ₹8,000 / ₹20,000    40%                    │
│  ████████████░░░░░░░░                       │
│  ₹12,000 more to reach your goal            │
│                                             │
│  ARCHIVED                                   │
│  [Show 1 archived account ▼]                │
└─────────────────────────────────────────────┘
```

### Key Components
1. **Header** — Title + "+ Add Account" primary button
2. **Total Balance** — Large amount with eye icon (hide/show)
3. **Active Accounts List** — Card-style rows: Icon | Name | Type | Masked ID | Balance (right)
4. **Savings & Goals** — Progress bar, target amount, remaining
5. **Archived Section** — Collapsible, dimmed opacity, 50%

### Interactions
- Click account → navigate to `/accounts/[id]`
- Eye icon → toggle balance visibility globally
- Archive → soft-delete, move to archived section

### Data Requirements
- GET /accounts?include_archived=true
- GET /savings-goals (if separate from accounts)

---

## PAGE 04 — ACCOUNT DETAIL
**Route:** `/accounts/[id]`  
**Complexity:** ⭐⭐⭐⭐☆ (High)  
**Phase:** v1 (MVP — Core)  
**Purpose:** Focused view of one account.

### Layout
```
┌─────────────────────────────────────────────┐
│  ← Accounts                                 │
│                                             │
│  🏦  HDFC Savings                           │
│  Bank    ••4821                             │
│                                             │
│  CURRENT BALANCE                            │
│  ₹32,400                                    │
│                                             │
│  [Edit]  [Archive]                          │
│                                             │
│  Period: [Today] [Week] [Month] [Custom]    │
│                                             │
│  Total In: +₹5,000   Total Out: −₹3,420    │
│  Transactions: 12                           │
│                                             │
│  TRANSACTION HISTORY                        │
│  ┌─────────────────────────────────────────┐ │
│  │ [Reuse TransactionTable component]      │ │
│  │ (NO Account column — already known)      │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  "No transactions from this account yet"    │
│  [Add First Transaction]                    │
└─────────────────────────────────────────────┘
```

### Key Components
1. **Back Navigation** — "← Accounts" breadcrumb
2. **Account Hero** — Icon, name, type, masked ID, current balance (large)
3. **Actions** — Edit, Archive buttons
4. **Period Selector** — Filter transaction history
5. **Account Stats** — Total In, Total Out, Transaction count
6. **Transaction History** — Reuse TransactionRow component, NO account column

### Data Requirements
- GET /accounts/{id}
- GET /transactions?account_id={id}
- PATCH /accounts/{id}
- DELETE /accounts/{id} (soft)

---

## PAGE 05 — BUDGETS
**Route:** `/budgets`  
**Complexity:** ⭐⭐⭐⭐☆ (High)  
**Phase:** v1 (MVP — Core)  
**Purpose:** Control spending before overspending.

### Layout
```
┌─────────────────────────────────────────────┐
│  Budgets                                    │
│  [← June]  July 2026  [August →]   [+ Add] │
│                                             │
│  OVERALL BUDGET                             │
│  ₹12,800 spent of ₹18,000                   │
│  ████████████████████░░░░░░  71%             │
│  8 days remaining                           │
│                                             │
│  NEEDS ATTENTION                            │
│  ┌─────────────────────────────────────────┐ │
│  │ 🍔 Food                                │ │
│  │ ₹4,100 / ₹3,500   OVER LIMIT           │ │
│  │ ████████████████████████████  117%     │ │
│  │ ₹600 over limit                        │ │
│  │ [View transactions] [Edit limit]       │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ON TRACK                                   │
│  ┌─────────────────────────────────────────┐ │
│  │ 🚌 Transport   ₹800 / ₹1,500   53%    │ │
│  │ ██████████████░░░░░░░░░░░░░░░░         │ │
│  │                                          │
│  │ 🛒 Shopping    ₹1,200 / ₹2,000  60%   │ │
│  │ █████████████████░░░░░░░░░░░░░         │ │
│  │                                          │
│  │ 📚 Education   ₹400 / ₹1,000   40%    │ │
│  │ █████████░░░░░░░░░░░░░░░░░░░         │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  💡 AI SUGGESTION                           │
│  "Based on your last 2 months, we suggest   │
│   increasing your Food budget to ₹5,000"    │
│  [Review Suggestions →]                     │
└─────────────────────────────────────────────┘
```

### Key Components
1. **Month Navigator** — ← → arrows, current month, "+ Add Budget Category"
2. **Overall Budget Banner** — Total spent / Total limit, progress bar, days remaining
3. **Needs Attention Section** — Over-limit budgets first, red styling, action buttons
4. **On Track Section** — Remaining budgets, color-coded by percentage:
   - <80%: Green
   - 80-99%: Amber
   - 100%+: Red
5. **AI Suggestion Banner** — Conditional (only when 2+ months data exists)

### Budget Status Calculation
```typescript
function getBudgetStatus(spent: number, limit: number): Status {
  const pct = (spent / limit) * 100;
  if (pct >= 100) return { color: 'danger', label: 'Over limit' };
  if (pct >= 80) return { color: 'warning', label: 'Almost there' };
  return { color: 'success', label: 'On track' };
}
```

### Data Requirements
- GET /budgets?period=YYYY-MM
- GET /transactions?period=YYYY-MM (for spent calculation)
- POST /budgets
- PATCH /budgets/{id}
- DELETE /budgets/{id}

---

## PAGE 06 — ANALYTICS
**Route:** `/analytics`  
**Complexity:** ⭐⭐⭐⭐⭐ (Very High)  
**Phase:** v1.1 (Post-MVP — Core Dashboard is v1)  
**Purpose:** Discover spending patterns, compare trends.

### Layout
```
┌─────────────────────────────────────────────┐
│  Analytics                                  │
│  Period: [Last 6 Months ▼]  Account: [All ▼]│
│                                             │
│  [Overview] [Spending] [Trends]             │
│  ────────                                   │
│                                             │
│  Income vs Expense                          │
│  [Grouped bar chart: 6 months]              │
│  Income: green bars  Expense: red bars      │
│                                             │
│  ┌────────────────────┐ ┌──────────────────┐ │
│  │ Spending Breakdown│ │ Top Categories  │ │
│  │ [Donut chart]     │ │ 🍔 Food  ███ ₹4.1K│ │
│  │                   │ │ 🚌 Trans ███ ₹2.3K│ │
│  │                   │ │ 🏠 Rent  ███ ₹3.2K│ │
│  └────────────────────┘ └──────────────────┘ │
│                                             │
│  SPENDING TAB (when selected)               │
│  ┌─────────────────────────────────────────┐ │
│  │ 🍔 Food & Dining        ▼  ₹4,100     │ │
│  │   Swiggy        28 Jul      −₹450      │ │
│  │   Zomato        22 Jul      −₹640      │ │
│  │   ...                                  │ │
│  ├─────────────────────────────────────────┤ │
│  │ 🚌 Transport            ▼  ₹2,304     │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  TRENDS TAB (when selected)                 │
│  [Line chart: Daily spending]               │
│  Current month: solid line                  │
│  Previous month: dashed line                │
│                                             │
│  INSUFFICIENT DATA                          │
│  "Come back in a few days"                  │
│  (Shown when < 7 days of data)              │
└─────────────────────────────────────────────┘
```

### Key Components
1. **Header** — Title + Period dropdown + Account dropdown
2. **Tab Navigation** — Overview | Spending | Trends (animated underline indicator)
3. **Overview Tab:**
   - Income vs Expense grouped bar chart (6 months)
   - Spending Breakdown donut chart
   - Top Categories list (horizontal bars, sorted by amount)
4. **Spending Tab:**
   - Expandable category rows
   - Expanded: sub-transactions list
5. **Trends Tab:**
   - Daily spending line chart
   - Current month (solid) vs Previous month (dashed)
6. **Insufficient Data State** — Shown when < 7 days of transactions

### Chart Rules
- All charts use Recharts (NOT Tremor default styling)
- Custom Prism wrappers around Recharts components
- Monochromatic purple for donut/pie
- Green for income bars, red for expense bars
- Tooltips: custom styled, show exact amounts
- Responsive: charts reflow on resize

### Data Requirements
- GET /analytics/overview?period=X&account=Y
- GET /analytics/spending?period=X
- GET /analytics/trends?period=X

---

## PAGE 07 — AI ASSISTANT
**Route:** `/assistant`  
**Complexity:** ⭐⭐⭐⭐⭐ (Very High)  
**Phase:** v1.1 (Post-MVP — AI summaries in Dashboard are v1)  
**Purpose:** Natural language financial intelligence. NOT a ChatGPT clone.

### Layout
```
┌─────────────────────────────────────────────┐
│  Prism Assistant              [Clear] [?]  │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  │      ✨ [Prism sparkle icon]            │ │
│  │                                         │ │
│  │   "Ask me about your money"            │ │
│  │                                         │ │
│  │   "I know your spending. Try one:"     │ │
│  │                                         │ │
│  │   ┌─────────────────────────────────┐  │ │
│  │   │ Where did my money go this month?│ │ │
│  │   ├─────────────────────────────────┤  │ │
│  │   │ Am I on track with my budget?    │ │ │
│  │   ├─────────────────────────────────┤  │ │
│  │   │ How much did I spend on food?    │ │ │
│  │   ├─────────────────────────────────┤  │ │
│  │   │ Summarize last month for me      │ │ │
│  │   ├─────────────────────────────────┤  │ │
│  │   │ What's my biggest expense?       │ │ │
│  │   ├─────────────────────────────────┤  │ │
│  │   │ Should I adjust my budget?       │ │ │
│  │   └─────────────────────────────────┘  │ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  CHAT (after interaction)                   │
│  ┌─────────────────────────────────────────┐ │
│  │  Where did my money go?        [user] │ │
│  │                              right-aligned│
│  │                              bg-violet-50│
│  ├─────────────────────────────────────────┤ │
│  │  ✨ You spent ₹4,100 on food this      │ │
│  │     month — that's 32% of total.       │ │
│  │                              left-aligned│
│  │                              bg-white   │ │
│  │                              border     │ │
│  ├─────────────────────────────────────────┤ │
│  │  ● ● ● Thinking about your finances...│ │
│  │                              left-aligned│
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │ Ask anything about your finances...  [→]│ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Key Components
1. **Header** — "Prism Assistant" + Clear chat + Help
2. **Empty State** — Sparkle icon, title, subtitle, 6 quick prompt buttons
3. **Chat Messages:**
   - User: right-aligned, violet-50 background, rounded-lg
   - AI: left-aligned, white background, 1px border, subtle left violet border accent
   - Thinking: 3 animated dots, "Thinking about your finances..."
4. **Input Bar** — Text input + send button, disabled when empty
5. **Auto-scroll** — New messages scroll into view

### Architecture Rule
**Chat UI is separate from Response Generation.**
- Frontend: Manages message state, rendering, scroll, input
- Backend: Receives query → generates SQL → executes → formats with LLM → returns
- Future: Can swap LLM provider without touching UI

### Data Requirements
- POST /ai/query (NLQ)
- POST /ai/summary (monthly summary)
- WebSocket or SSE for streaming responses

---

## PAGE 08 — GROUPS
**Route:** `/groups`  
**Complexity:** ⭐⭐⭐⭐☆ (High)  
**Phase:** v2 (Post-MVP — Split Bills feature)  
**Purpose:** Track shared expenses and settlements.

### Layout
```
┌─────────────────────────────────────────────┐
│  Groups                          [+ New]    │
│                                             │
│  You are owed ₹1,200                        │
│  You owe ₹450                               │
│  3 active groups                            │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │ 🏠 Hostel Room 204                      │ │
│  │ 4 members              ₹3,400 total       │ │
│  │ +₹800 owed to you    [View →]           │ │
│  │ [👤👤👤👤]                               │ │
│  ├─────────────────────────────────────────┤ │
│  │ 🏖 Goa Trip                             │ │
│  │ 6 members                               │ │
│  │ −₹450 you owe        [View →]           │ │
│  ├─────────────────────────────────────────┤ │
│  │ 📚 Study Group                         │ │
│  │ 3 members                               │ │
│  │ ✓ All settled        [View →]           │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  "No groups yet"                            │
│  "Split expenses with friends, track who    │
│   owes who."                                │
│  [Create your first group]                  │
└─────────────────────────────────────────────┘
```

### Key Components
1. **Header** — Title + "+ New Group" button
2. **Settlement Summary** — Owed to you (green), You owe (red), Active count
3. **Group Cards** — Avatar/icon, name, member count, total, your balance, member avatars
4. **Balance States:**
   - Positive (green): "+₹X owed to you"
   - Negative (red): "−₹X you owe"
   - Zero (muted): "✓ All settled"

### Data Requirements
- GET /groups
- POST /groups

---

## PAGE 09 — GROUP DETAIL
**Route:** `/groups/[id]`  
**Complexity:** ⭐⭐⭐⭐⭐ (Very High)  
**Phase:** v2 (Post-MVP)  
**Purpose:** Complete financial relationship inside one group.

### Layout
```
┌─────────────────────────────────────────────┐
│  ← Groups                                   │
│                                             │
│  🏠 Hostel Room 204                         │
│  [👤👤👤👤]  4 members                      │
│  Total group spend: ₹3,400                  │
│                                             │
│  YOUR BALANCE                               │
│  +₹800 — 2 people owe you                 │
│  [Settle Up]                                │
│                                             │
│  MEMBERS                                    │
│  ┌─────────────────────────────────────────┐ │
│  │ 👤 You           +₹800  owes you      │ │
│  │ 👤 Riya          −₹450  you owe       │ │
│  │ 👤 Arjun         ✓ settled            │ │
│  │ 👤 Priya         +₹350  owes you      │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  EXPENSES                                   │
│  Description    Paid By    Your Share   Total│
│  ┌─────────────────────────────────────────┐ │
│  │ Dinner          Arjun      ₹200      ₹800│ │
│  │ Groceries       You        ₹150      ₹600│ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  [+ Add Group Expense]                      │
└─────────────────────────────────────────────┘
```

### Key Components
1. **Back Navigation** — "← Groups"
2. **Group Hero** — Icon, name, member avatars, member count, total spend
3. **My Balance** — Large amount, settlement status, "Settle Up" button
4. **Members List** — Avatar, name, balance, status pill
5. **Expenses Table** — Description, Paid By, Your Share, Total
6. **Add Group Expense** — Opens QuickAdd with group pre-selected + split config

### QuickAdd Group Mode
When adding expense from group page:
- Group is pre-selected (disabled)
- "Split" section appears
- Options: Equal split, Custom split (per-member amounts)
- System calculates "Your share" automatically

### Data Requirements
- GET /groups/{id}
- GET /groups/{id}/members
- GET /groups/{id}/expenses
- POST /groups/{id}/expenses
- POST /groups/{id}/settlements

---

## PAGE 10 — SETTINGS
**Route:** `/settings`  
**Complexity:** ⭐⭐⭐⭐☆ (High)  
**Phase:** v1 (MVP — Core)  
**Purpose:** Manage personal Prism configuration.

### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar │  Settings                                        │
│          │                                                  │
│  Profile │  ┌─────────────────────────────────────────────┐ │
│  Security│  │ PROFILE                                       │ │
│  Notif.  │  │                                               │ │
│  Data    │  │  [👤 Avatar]  [Change photo]                  │ │
│          │  │                                               │ │
│  │  Full Name:        [Rahul Sharma        ]     │ │
│  │  College:          [IIT Bombay          ]     │ │
│  │  Email:            [rahul@iitb.ac.in     ] 🔒  │ │
│  │  Currency:         [INR (₹) ▼]                │ │
│  │                                               │ │
│  │  [Save Changes]  [Cancel]                     │ │
│  └─────────────────────────────────────────────┘ │
│          │                                                  │
│          │  ┌─────────────────────────────────────────────┐ │
│          │  │ NOTIFICATIONS                                 │ │
│          │  │                                               │ │
│          │  │  Alert Type          Email    In-App          │ │
│          │  │  ────────────────────────────────────────    │ │
│          │  │  Budget at 80%       [●──]    [──●]          │ │
│          │  │  Budget exceeded     [●──]    [──●]          │ │
│          │  │  Low balance         [●──]    [──●]          │ │
│          │  │  Recurring reminder  [●──]    [──●]          │ │
│          │  │  Weekly summary      [●──]    [──●]          │ │
│          │  │  AI insights         [●──]    [──●]          │ │
│          │  └─────────────────────────────────────────────┘ │
│          │                                                  │
│          │  ┌─────────────────────────────────────────────┐ │
│          │  │ DATA & PRIVACY                                │ │
│          │  │                                               │ │
│          │  │  [Download my data as CSV →]                  │ │
│          │  │                                               │ │
│          │  │  ── Danger Zone ──                            │ │
│          │  │  [Delete Account]                               │ │
│          │  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<1024px)
- Single column list of sections
- Tapping a section opens its content in a new screen
- Back button returns to section list

### Key Components
1. **Desktop:** Two-column — 220px left nav + content panel
2. **Mobile:** Section list → detail drill-down
3. **Profile Section:** Avatar upload, name, college, email (read-only), currency
4. **Notifications Section:** Table with alert types + email/in-app toggles
5. **Data & Privacy:** Export CSV (with loading → success toast), Delete Account (confirm modal)

### Form States
- Dirty state tracking (enable Save only when changed)
- Validation (name required, college optional)
- Loading state during save
- Success toast on save

### Data Requirements
- GET /users/me
- PATCH /users/me
- GET /settings/notifications
- PATCH /settings/notifications
- GET /export/transactions.csv
- DELETE /users/me (with confirmation)

---

## PAGE 11 — ONBOARDING
**Route:** `/onboarding`  
**Complexity:** ⭐⭐⭐⭐⭐ (Very High)  
**Phase:** v1 (MVP — Critical for activation)  
**Purpose:** Get new user to useful financial state in ~2 minutes.

### Layout (Centered, max-width 480px)
```
┌─────────────────────────────────────────────┐
│                                             │
│           [Prism Logo]                      │
│                                             │
│           ● ○ ○ ○  Step 1 of 4             │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  │   Welcome to Prism 👋                   │ │
│  │                                         │ │
│  │   Let's set you up in 2 minutes.       │ │
│  │                                         │ │
│  │   Your name                             │ │
│  │   [________________]                    │ │
│  │                                         │ │
│  │   College / University                  │ │
│  │   [________________]                    │ │
│  │                                         │ │
│  │   [Continue]                            │ │
│  │   [Skip for now]                        │ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  STEP 2 — FIRST ACCOUNT                     │
│  "Where does your money live?"              │
│                                             │
│  [💵 Cash] [🏦 Bank] [📱 UPI/Wallet]        │
│  [📈 FD/Savings]                            │
│                                             │
│  Selected: Bank                             │
│  Name: [HDFC Savings        ]               │
│  Last 4 digits: [4821      ]                │
│  Opening balance: [₹ 32,000  ]                │
│                                             │
│  [Add Account]  [Skip]                    │
│                                             │
│  STEP 3 — MONTHLY BUDGET                    │
│  "How much can you spend per month?"        │
│                                             │
│  ₹ [18,000      ]                           │
│  (Large centered input)                     │
│                                             │
│  [Set Budget]  [Skip]                     │
│                                             │
│  STEP 4 — FIRST EXPENSE                     │
│  "Add your first expense"                   │ │
│                                             │
│  ₹ [180        ]                            │
│  Category: [Food & Dining ▼]                │
│  Account: [HDFC Savings ▼]                  │
│                                             │
│  [Add This Expense]                         │
│                                             │
│  SUCCESS                                    │
│  "₹180 logged! 🎉"                          │
│  [Go to Dashboard →]                          │
│                                             │
└─────────────────────────────────────────────┘
```

### Key Components
1. **Progress Dots** — Step indicator, 4 steps
2. **Step 1: Welcome** — Name + College, Continue/Skip
3. **Step 2: First Account** — Account type selector (chips), conditional form fields
4. **Step 3: Monthly Budget** — Large amount input, centered, prominent
5. **Step 4: First Expense** — Quick-add style, pre-filled account from step 2
6. **Success Screen** — Celebration message, CTA to dashboard

### State Machine
```
Step 1 (Welcome)
  → Continue → Step 2 (data preserved)
  → Skip → Step 2 (empty data)

Step 2 (First Account)
  → Add Account → Step 3 (account data preserved)
  → Skip → Step 3
  → Back → Step 1

Step 3 (Budget)
  → Set Budget → Step 4 (budget data preserved)
  → Skip → Step 4
  → Back → Step 2

Step 4 (First Expense)
  → Add Expense → Success Screen (all data submitted)
  → Back → Step 3

Success
  → Go to Dashboard → /dashboard (with onboarding data applied)
```

### Data Flow
All 4 steps collect data client-side. On "Add This Expense" (Step 4):
1. POST /accounts (from Step 2 data)
2. POST /budgets (from Step 3 data)
3. POST /transactions (from Step 4 data)
4. Redirect to /dashboard

If any step was skipped, its data is not submitted.

### Transitions
- Forward: Slide left (current exits left, new enters from right)
- Back: Slide right (current exits right, new enters from left)
- Framer Motion AnimatePresence

### Data Requirements
- POST /accounts
- POST /budgets
- POST /transactions
- GET /categories (for expense step)

---

## Cross-Cutting Components (All Pages)

### AppShell
```
Desktop:
┌─────────────────────────────────────────────┐
│  Sidebar (240px) │  Main Content             │
│  [fixed]         │  [scrollable]             │
└─────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────────────────────┐
│  Main Content                               │
│  [scrollable]                               │
│  ─────────────────────────────────────────  │
│  [🏠] [📋] [💰] [📊] [⚙️]  Bottom Nav       │
└─────────────────────────────────────────────┘
```

**Sidebar Items (Desktop):**
1. Dashboard (🏠)
2. Transactions (📋)
3. Accounts (💳)
4. Budgets (🎯)
5. Analytics (📊)
6. Assistant (✨) — v1.1
7. Groups (👥) — v2
8. Settings (⚙️)

**Bottom Nav (Mobile):** Dashboard, Transactions, QuickAdd (center, elevated), Accounts, Settings

### QuickAddModal (Global)
- Triggered by: FAB click, keyboard "N", or "+ Add" buttons
- Bottom sheet on mobile, centered modal on desktop
- Fields: Type (Expense/Income toggle), Amount (₹), Category (chips), Account (dropdown), Note (optional), Date (default today)
- Target: < 10 seconds for default-category expense
- Success: Toast + optimistic dashboard update

### Toast System
- Position: Bottom-center (mobile), Top-right (desktop)
- Types: Success (green), Error (red), Info (blue)
- Auto-dismiss: 3 seconds
- Action support: "Undo" for delete

### Loading States (Every Page)
- Skeleton cards for stat sections
- Shimmer rows for tables/lists
- Spinner for charts
- Never show blank white screen

### Empty States (Every Page)
- Icon (64px, muted)
- Title (h2)
- Description (body, muted)
- Action button (primary)
- Example: "No transactions yet" + "Add your first expense"
