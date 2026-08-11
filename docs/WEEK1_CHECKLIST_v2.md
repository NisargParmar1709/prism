# WEEK1_CHECKLIST_v2.md
## Prism — Week 1: Auth, Onboarding, Accounts & Savings Goals

> **Duration:** 5 days (Days 1–5)
> **Goal:** A user can register → verify email → complete onboarding → create accounts → set savings goals → see them on a basic dashboard.
> **Exit Gate:** You can register a real account, verify it, complete the 4-step onboarding, create 3 account types, set 2 savings goals, and see them all on a working dashboard.

---

## Pre-Reading (Do This First)
Before starting any task, read these files in order:
1. `PROJECT_CONTEXT_v2.md`
2. `INSFORGE_CONSTRAINTS.md`
3. `FINANCIAL_SAFETY_RULES.md`
4. `DESIGN_SYSTEM_v2.md`
5. `PAGES_SPEC.md` (Pages 01, 03, 04, 10, 11)
6. `API_CONTRACT_v2.md` (Sections 2, 3, 4, 11, 16)

---

## Day 1: Auth & Profile Foundation

### Task 1.1: InsForge Auth Integration

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PROJECT_CONTEXT_v2.md (Auth section, Schema v2.1) and /INSFORGE_CONSTRAINTS.md (Section 1: Authentication).

## TASK
Set up InsForge Auth integration in the Next.js frontend.

Create:
1. `apps/web/lib/insforge.ts`:
   - Initialize InsForge client with createClient from @insforge/supabase-js
   - Export supabase instance
   - Configure auth settings (autoRefreshToken, persistSession)

2. `apps/web/lib/auth.ts`:
   - signUp(email, password) → calls supabase.auth.signUp
   - signIn(email, password) → calls supabase.auth.signInWithPassword
   - signOut() → calls supabase.auth.signOut
   - resetPassword(email) → calls supabase.auth.resetPasswordForEmail
   - getSession() → returns current session
   - onAuthStateChange listener for session changes

3. `apps/web/app/login/page.tsx`:
   - Email + password form (React Hook Form + Zod)
   - "Don't have an account? Register" link
   - "Forgot password?" link
   - Error handling with toast
   - Loading state on submit
   - Redirect to /onboarding if onboarding_completed = false
   - Redirect to /dashboard if onboarding_completed = true

4. `apps/web/app/register/page.tsx`:
   - Email + password + confirm password form
   - Password strength indicator (8+ chars, 1 number, 1 letter)
   - Terms checkbox
   - Error handling (email already exists, weak password)
   - After signup: show "Check your email for verification link" message
   - DO NOT auto-login after signup (wait for email verification)

5. `apps/web/app/forgot-password/page.tsx`:
   - Email input only
   - Submit → send reset link
   - Success message: "Check your email for reset link"

6. `apps/web/app/auth/callback/route.ts`:
   - Handle email verification callback from InsForge
   - Exchange code for session
   - Redirect to /onboarding (new user) or /dashboard (existing)

## CONSTRAINTS
- Use InsForge Auth ONLY. Do NOT create custom users table.
- Password must be 8+ chars with at least 1 letter and 1 number (enforced client AND server)
- Email verification is REQUIRED before accessing app
- Use httpOnly cookies for session (NOT localStorage)
- All auth pages use light mode design tokens
- Forms must show validation errors inline

## VERIFICATION
1. Register a new email → receive verification email
2. Click verification link → redirected to /onboarding
3. Try accessing /dashboard without verification → redirected to /login
4. Login with unverified email → show "Please verify your email" message
5. Login with verified email → redirected to /dashboard
6. Forgot password flow works end-to-end
7. All auth pages render correctly on mobile (360px)
```

**Human Check:** Create a test email (or use + alias). Walk through every auth flow manually. Check mobile rendering.

---

### Task 1.2: FastAPI Auth Middleware & Profile Schema

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PROJECT_CONTEXT_v2.md (Backend stack), /FINANCIAL_SAFETY_RULES.md (Rules 4, 9, 12), /API_CONTRACT_v2.md (Section 2, 3).

## TASK
Set up FastAPI auth middleware and create the profiles table.

Create:
1. `apps/api/app/dependencies.py`:
   - `get_current_user()` dependency:
     - Extract Bearer token from Authorization header
     - Verify JWT using InsForge JWT secret (PyJWT)
     - Extract user_id from token payload
     - Return user_id
     - If invalid/expired: raise 401 with standard error shape
   - `get_db()` dependency: async SQLAlchemy session
   - `get_redis()` dependency: Redis connection

2. `apps/api/app/models/profile.py`:
   - Profile model:
     - id: UUID, primary key
     - user_id: UUID, unique, FK to auth.users(id) (just reference, not enforced)
     - full_name: string, nullable
     - college: string, nullable
     - avatar_url: string, nullable
     - currency: string, default "INR"
     - onboarding_completed: boolean, default false
     - created_at: TIMESTAMPTZ, default now()
     - updated_at: TIMESTAMPTZ, default now()
   - Enable RLS: `CREATE POLICY "Users can only access their own profile"`

3. `apps/api/app/schemas/profile.py`:
   - ProfileCreate, ProfileUpdate, ProfileResponse Pydantic schemas
   - Currency must be "INR" only (enum)

4. `apps/api/app/routers/profiles.py`:
   - GET /users/me → return current user's profile
   - PATCH /users/me → update profile (name, college, avatar, currency)
   - POST /users/me (upsert) → create profile if doesn't exist

5. `apps/api/app/services/profile_service.py`:
   - get_or_create_profile(user_id) → returns profile, creates if missing
   - update_profile(user_id, data) → updates and returns

6. Alembic migration:
   - Create profiles table
   - Add RLS policy
   - Add trigger for updated_at

## CONSTRAINTS
- user_id references auth.users but we don't create the users table (InsForge manages it)
- RLS policy: `user_id = auth.uid()`
- All timestamps are TIMESTAMPTZ (UTC)
- Currency is "INR" only for v1
- onboarding_completed defaults to false

## VERIFICATION
1. Migration runs successfully: `alembic upgrade head`
2. GET /users/me with valid JWT returns profile (or creates default)
3. PATCH /users/me updates profile correctly
4. RLS works: try to access another user's profile → 403
5. Profile created automatically on first API call if missing
```

**Human Check:** Test with curl. Verify RLS by trying to read another user's profile.

---

## Day 2: Onboarding Wizard

### Task 2.1: Onboarding State Machine & UI

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md Section "PAGE 11 — ONBOARDING" and /DESIGN_SYSTEM_v2.md.

## TASK
Build the complete 4-step onboarding wizard.

Create:
1. `apps/web/app/onboarding/page.tsx`:
   - Centered layout, max-width 480px, light background
   - Progress dots (4 steps)
   - Framer Motion AnimatePresence for transitions:
     - Forward: current slides left, new enters from right
     - Back: current slides right, new enters from left
   - State machine preserving data between steps

2. Step 1: Welcome (`components/onboarding/StepWelcome.tsx`):
   - "Welcome to Prism 👋"
   - "Let's set you up in 2 minutes."
   - Full Name input (required)
   - College/University input (optional)
   - [Continue] primary button
   - [Skip for now] text button
   - Validation: name must be 2+ chars

3. Step 2: First Account (`components/onboarding/StepAccount.tsx`):
   - "Where does your money live?"
   - Account type selector: horizontal scroll of chips
     - 💵 Cash
     - 🏦 Bank
     - 📱 UPI/Wallet
     - 📈 FD/Savings
   - Selected type reveals form:
     - Name (required)
     - Last 4 digits (optional, only for bank)
     - Opening balance (required, ₹ AmountInput)
   - [Add Account] primary button
   - [Skip] text button
   - [Back] text button

4. Step 3: Monthly Budget (`components/onboarding/StepBudget.tsx`):
   - "How much can you spend per month?"
   - Large centered AmountInput (₹)
   - Default: ₹18,000
   - [Set Budget] primary button
   - [Skip] text button
   - [Back] text button

5. Step 4: First Expense (`components/onboarding/StepExpense.tsx`):
   - "Add your first expense"
   - Amount (₹ AmountInput)
   - Category dropdown (fetch from API)
   - Account dropdown (pre-select from Step 2)
   - Note (optional)
   - [Add This Expense] primary button
   - [Back] text button

6. Success Screen (`components/onboarding/StepSuccess.tsx`):
   - "₹180 logged! 🎉"
   - [Go to Dashboard →] primary button

7. `apps/web/hooks/use-onboarding.ts`:
   - React Hook Form managing all 4 steps
   - Zod schema for validation
   - onSubmit: calls API in sequence:
     1. PATCH /users/me (name, college)
     2. POST /accounts (from Step 2)
     3. POST /budgets (from Step 3)
     4. POST /transactions (from Step 4)
     5. PATCH /users/me (onboarding_completed: true)
     6. Redirect to /dashboard

## CONSTRAINTS
- All 4 steps must preserve data when going back/forward
- Skip button skips that step's data submission
- If Step 2 skipped, no account created; Step 4 must show "No accounts yet" and skip
- Animations must be smooth (Framer Motion)
- Mobile-first: test at 360px
- Light mode only
- Amount inputs use JetBrains Mono, tabular-nums

## VERIFICATION
1. Walk through all 4 steps on mobile
2. Go back from Step 3 to Step 2 → data preserved
3. Skip Step 2 → Step 4 handles "no accounts" gracefully
4. Submit → all API calls succeed, redirected to /dashboard
5. Verify profile, account, budget, transaction created in DB
6. Refresh /onboarding after completion → redirected to /dashboard
```

**Human Check:** Complete onboarding with real data. Verify in InsForge dashboard that records were created.

---

## Day 3: Account Management

### Task 3.1: Account CRUD Backend

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /FINANCIAL_SAFETY_RULES.md (Rules 1, 2, 3, 5, 6), /API_CONTRACT_v2.md (Section 4).

## TASK
Build the complete Account CRUD backend.

Create:
1. `apps/api/app/models/account.py`:
   - Account model:
     - id: UUID, PK
     - user_id: UUID, indexed
     - name: string(50), not null
     - type: enum(cash, bank, wallet, fd, savings, emergency)
     - last_4_digits: string(4), nullable
     - opening_balance: NUMERIC(12,2), default 0
     - currency: string(3), default "INR"
     - is_archived: boolean, default false
     - is_emergency_fund: boolean, default false
     - emergency_target: NUMERIC(12,2), nullable
     - created_at: TIMESTAMPTZ
     - updated_at: TIMESTAMPTZ
   - RLS: `user_id = auth.uid()`
   - Index on (user_id, is_archived)

2. `apps/api/app/schemas/account.py`:
   - AccountCreate, AccountUpdate, AccountResponse
   - current_balance: computed, NOT stored (Rule 2)
   - Validation: name 1-50 chars, type from enum, opening_balance >= 0

3. `apps/api/app/services/account_service.py`:
   - create_account(user_id, data) → create, return with computed balance
   - get_accounts(user_id, include_archived) → list with computed balances
   - get_account(user_id, account_id) → single with computed balance + last 10 transactions
   - update_account(user_id, account_id, data) → update, return with balance
   - archive_account(user_id, account_id) → set is_archived = true
   - delete_account(user_id, account_id) → soft delete (archive)
   - 
   - COMPUTED BALANCE FUNCTION:
     ```python
     async def compute_balance(db, account_id: UUID) -> Decimal:
         result = await db.execute(
             select(func.coalesce(func.sum(Transaction.amount), Decimal('0')))
             .where(Transaction.account_id == account_id)
             .where(Transaction.deleted_at.is_(None))
         )
         transactions_sum = result.scalar()
         account = await db.get(Account, account_id)
         return account.opening_balance + transactions_sum
     ```

4. `apps/api/app/routers/accounts.py`:
   - GET /accounts → list (with computed balances)
   - POST /accounts → create
   - GET /accounts/{id} → single (with computed balance + transactions)
   - PATCH /accounts/{id} → update (cannot change type)
   - DELETE /accounts/{id} → archive (soft delete)

5. Alembic migration for accounts table + RLS + index

## CONSTRAINTS
- NO `balance` column in accounts table (Rule 2)
- Balance computed from opening_balance + SUM(transactions.amount)
- Soft delete only (is_archived = true)
- Hard delete only allowed within 5 minutes of creation
- After 5 minutes: deletion creates reversal transaction
- Type cannot be changed after creation
- All amounts NUMERIC(12,2)

## VERIFICATION
1. Create account → GET /accounts shows correct computed balance (should equal opening_balance since no transactions)
2. Archive account → still appears with include_archived=true, hidden otherwise
3. Try to change type via PATCH → validation error
4. Verify RLS: user A cannot see user B's accounts
5. Verify balance computation is correct with test transactions
```

**Human Check:** Create 3 accounts via API. Verify balances are correct. Try to access another user's accounts → should fail.

---

### Task 3.2: Accounts Page UI

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md Section "PAGE 03 — ACCOUNTS" and /DESIGN_SYSTEM_v2.md.

## TASK
Build the Accounts page UI.

Create:
1. `apps/web/app/accounts/page.tsx`:
   - Header: "Accounts" + "+ Add Account" primary button
   - Total Balance: large amount with eye icon (toggle visibility)
   - Active Accounts list:
     - SurfaceCard for each account
     - Icon (category-based) | Name | Type | Masked ID | Balance (right)
     - Balance color: neutral for positive, no color coding needed
   - Savings & Goals section:
     - Goal name
     - Progress bar
     - "₹X saved of ₹Y" | "Z%"
     - "₹remaining more to reach your goal"
   - Archived section: collapsible, dimmed, "Show N archived accounts"

2. `apps/web/components/accounts/AccountCard.tsx`:
   - SurfaceCard wrapper
   - Account icon (40px circle, tinted background based on type)
   - Name (text-body, weight 500)
   - Type + masked ID (text-small, muted)
   - Balance (text-h3, mono, right-aligned)
   - Click → navigate to /accounts/[id]

3. `apps/web/components/accounts/AddAccountModal.tsx`:
   - Modal (desktop) / Bottom sheet (mobile)
   - Account type selector (chips)
   - Conditional fields:
     - All: Name, Opening balance
     - Bank only: Last 4 digits
     - Emergency fund: Target amount
   - Validation: name required, balance >= 0
   - Submit → POST /accounts → invalidate cache → close modal

4. `apps/web/components/accounts/BalanceToggle.tsx`:
   - Eye icon button
   - Toggles all balance visibility globally
   - Persist preference in localStorage
   - When hidden: show "****" instead of amount

5. `apps/web/hooks/use-accounts.ts`:
   - TanStack Query hook for accounts list
   - createAccount mutation with optimistic update
   - archiveAccount mutation

## CONSTRAINTS
- Use SurfaceCard (white, subtle shadow)
- Amounts use JetBrains Mono, tabular-nums
- Eye toggle affects ALL balance displays across the app
- Mobile: single column, full-width cards
- Desktop: 2-column grid for account cards
- Light mode only

## VERIFICATION
1. Open /accounts → see all accounts with correct balances
2. Click "+ Add Account" → modal opens → create account → appears in list
3. Toggle eye icon → all balances hide/show
4. Click account → navigates to /accounts/[id]
5. Archive account → moves to archived section
6. Test on mobile (360px) — all actions reachable
```

**Human Check:** Create accounts via UI. Verify balances match. Test eye toggle. Test archive.

---

## Day 4: Account Detail & Savings Goals

### Task 4.1: Account Detail Page

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md Section "PAGE 04 — ACCOUNT DETAIL" and /DESIGN_SYSTEM_v2.md.

## TASK
Build the Account Detail page.

Create:
1. `apps/web/app/accounts/[id]/page.tsx`:
   - Back navigation: "← Accounts"
   - Account Hero:
     - Large icon
     - Account name (text-h1)
     - Type + masked ID (text-small, muted)
     - Current balance (text-display, mono)
     - [Edit] [Archive] buttons
   - Period selector: Today | Week | Month | Custom
   - Account Stats:
     - Total In (green)
     - Total Out (red)
     - Transaction count
   - Transaction History:
     - Reuse TransactionRow component
     - NO Account column (already known)
     - Filtered by account_id
   - Empty state: "No transactions from this account yet" + [Add First Transaction]

2. `apps/web/components/accounts/AccountEditModal.tsx`:
   - Pre-filled with current data
   - Cannot change type (disabled field)
   - Can change: name, opening_balance, last_4_digits
   - Submit → PATCH /accounts/{id}

3. `apps/web/components/accounts/ArchiveConfirmModal.tsx`:
   - "Archive [Account Name]?"
   - "Historical transactions will be preserved."
   - [Archive] danger button | [Cancel] ghost button

## CONSTRAINTS
- Reuse TransactionRow from accounts page (no duplication)
- Balance computed from API (not stored)
- Period filter affects transaction history only
- Mobile: single column, stacked layout
- Light mode only

## VERIFICATION
1. Navigate to /accounts/[id] → see correct balance and transactions
2. Edit account → changes reflect immediately
3. Archive account → redirected to /accounts, account in archived section
4. Period filter works (Today/Week/Month)
5. Empty state shows when no transactions
```

**Human Check:** Click into an account. Verify transactions are correct. Edit and archive work.

---

### Task 4.2: Savings Goals Backend

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /FINANCIAL_SAFETY_RULES.md (Rules 1, 2), /API_CONTRACT_v2.md (Section 11).

## TASK
Build the Savings Goals backend (MULTIPLE goals per user).

Create:
1. `apps/api/app/models/savings_goal.py`:
   - SavingsGoal model:
     - id: UUID, PK
     - user_id: UUID, indexed
     - name: string(50), not null
     - icon: string(emoji or icon name)
     - target_amount: NUMERIC(12,2), not null
     - current_amount: NUMERIC(12,2), default 0
     - monthly_contribution: NUMERIC(12,2), default 0
     - deadline: date, nullable
     - status: enum(on_track, behind, at_risk), computed
     - created_at: TIMESTAMPTZ
     - updated_at: TIMESTAMPTZ
   - RLS: `user_id = auth.uid()`

2. `apps/api/app/schemas/savings_goal.py`:
   - SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse
   - percentage: computed (current / target * 100)
   - remaining: computed (target - current)

3. `apps/api/app/services/savings_goal_service.py`:
   - create_goal(user_id, data) → create goal
   - get_goals(user_id) → list all goals with computed fields
   - get_goal(user_id, goal_id) → single with computed fields
   - update_goal(user_id, goal_id, data) → update
   - contribute(user_id, goal_id, amount) → add to current_amount
   - delete_goal(user_id, goal_id) → hard delete (user's own data)
   - 
   - STATUS CALCULATION:
     ```python
     def calculate_status(goal) -> str:
         if goal.deadline:
             days_remaining = (goal.deadline - today).days
             months_remaining = days_remaining / 30
             required_monthly = (goal.target - goal.current) / months_remaining
             if required_monthly <= goal.monthly_contribution * 0.8:
                 return "on_track"
             elif required_monthly <= goal.monthly_contribution * 1.2:
                 return "behind"
             else:
                 return "at_risk"
         return "on_track"  # No deadline = always on track
     ```

4. `apps/api/app/routers/savings_goals.py`:
   - GET /savings-goals → list
   - POST /savings-goals → create
   - GET /savings-goals/{id} → single
   - PATCH /savings-goals/{id} → update
   - PATCH /savings-goals/{id}/contribute → add amount
   - DELETE /savings-goals/{id} → delete

5. Alembic migration

## CONSTRAINTS
- Multiple goals per user (NOT limited to 1)
- target_amount > 0
- current_amount >= 0
- monthly_contribution >= 0
- All amounts NUMERIC(12,2)
- Status is computed, not stored (recalculate on fetch)

## VERIFICATION
1. Create 3 goals → GET /savings-goals returns all 3 with correct percentages
2. Contribute ₹5,000 to goal → current_amount updates, percentage recalculates
3. Verify status calculation with different deadlines
4. Delete goal → removed from list
5. RLS: user A cannot see user B's goals
```

**Human Check:** Create multiple goals. Verify percentages and status are correct.

---

### Task 4.3: Savings Goals UI (Dashboard Integration)

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md (Dashboard Savings Goals section, Page 03 Savings & Goals) and /DESIGN_SYSTEM_v2.md (CircularProgress, Section 5.6).

## TASK
Build the Savings Goals UI components.

Create:
1. `apps/web/components/savings/SavingsGoalCard.tsx`:
   - SurfaceCard wrapper
   - Top row: Icon (24px) | Goal name (text-h3) | Status pill (on_track/behind/at_risk)
   - Center: CircularProgress (120px mobile, 160px desktop)
     - Percentage in center (text-h2)
   - Below: "₹X saved" (text-body) | "₹Y remaining" (text-small, muted)
   - Bottom: "Monthly contribution" label + progress bar
     - "₹X / ₹Y" right-aligned
   - Click → navigate to goal detail (future) or open edit modal

2. `apps/web/components/savings/AddGoalModal.tsx`:
   - Name input
   - Icon selector (emoji picker or preset icons)
   - Target amount (₹ AmountInput)
   - Monthly contribution (₹ AmountInput)
   - Deadline (optional date picker)
   - [Create Goal] primary button

3. `apps/web/components/savings/ContributeModal.tsx`:
   - Goal name displayed
   - Amount input (₹)
   - [Contribute] primary button
   - Updates goal current_amount

4. `apps/web/app/dashboard/page.tsx` (update):
   - Add "Savings Goals" section at bottom
   - Horizontal scroll of SavingsGoalCard (mobile)
   - 3-column grid (desktop)
   - "+ Add goal" text button

## CONSTRAINTS
- CircularProgress animation: 800ms ease-out on mount
- Status pills:
  - on_track: bg-success-bg, text-success-text
  - behind: bg-warning-bg, text-warning-text
  - at_risk: bg-danger-bg, text-danger-text
- Mobile: horizontal scroll, cards 280px width
- Desktop: 3-column grid
- Light mode only
- Amounts use JetBrains Mono

## VERIFICATION
1. Dashboard shows savings goals section with all goals
2. Circular progress animates on page load
3. Status pills show correct colors
4. Click "+ Add goal" → modal → create → appears in dashboard
5. Click "Contribute" → modal → amount updates with animation
6. Test on mobile (360px) — horizontal scroll works
```

**Human Check:** Create 2-3 goals on dashboard. Verify animations, status colors, contributions update correctly.

---

## Day 5: Settings & Polish

### Task 5.1: Settings Page

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md Section "PAGE 10 — SETTINGS" and /DESIGN_SYSTEM_v2.md.

## TASK
Build the Settings page.

Create:
1. `apps/web/app/settings/page.tsx`:
   - Desktop: Two-column layout (220px sidebar nav + content panel)
   - Mobile: Section list → drill-down to detail
   - Sections: Profile, Notifications, Data & Privacy

2. `components/settings/ProfileSection.tsx`:
   - Avatar upload (placeholder circle + "Change photo" text)
   - Full Name input
   - College input
   - Email (read-only, with lock icon)
   - Currency dropdown (INR only for v1)
   - [Save Changes] primary button (disabled until dirty)
   - [Cancel] ghost button
   - Dirty state tracking
   - Success toast on save

3. `components/settings/NotificationsSection.tsx`:
   - Table layout:
     - Alert Type | Email | In-App
   - Rows:
     - Budget at 80%
     - Budget exceeded
     - Low account balance
     - Recurring reminder
     - Weekly summary
     - AI insights
   - Toggle switches for each
   - Auto-save on toggle change

4. `components/settings/DataPrivacySection.tsx`:
   - "Download my data as CSV" button
     - Click → show loading spinner
     - After 2s → "Download ready" + download starts
     - Success toast
   - Danger Zone section (red border)
     - "Delete Account" danger button
     - Click → ConfirmDeleteModal

5. `components/settings/ConfirmDeleteModal.tsx`:
   - "Delete your Prism account?"
   - Warning text about data deletion
   - Type "DELETE" to confirm
   - [Delete Account] danger button (disabled until typed)
   - [Cancel] ghost button

## CONSTRAINTS
- Desktop: persistent sidebar, content changes
- Mobile: section list → back button → section list
- Dirty state: enable Save only when form changed
- Email is read-only (managed by InsForge Auth)
- Currency is INR only (dropdown with 1 option for now)
- Light mode only

## VERIFICATION
1. Change name → Save → toast success → refresh → change persists
2. Toggle notification preferences → auto-saves
3. Click "Download CSV" → loading → download starts
4. Click "Delete Account" → modal → type DELETE → account deleted
5. Test on mobile (360px) — drill-down navigation works
```

**Human Check:** Update profile. Toggle notifications. Test delete flow (use test account).

---

### Task 5.2: Basic Dashboard Shell

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md Section "PAGE 01 — DASHBOARD" (simplified for v1) and /DESIGN_SYSTEM_v2.md.

## TASK
Build a basic Dashboard shell that displays v1 data.

Create:
1. `apps/web/app/dashboard/page.tsx`:
   - Greeting: "Good [morning/afternoon/evening], [Name] 👋"
   - Date display
   - Period selector: This Month | Last Month | Custom

   - Stats Row (4 cards):
     - Total Balance (large, from all accounts)
     - Income This Month (green)
     - Spent This Month (red)
     - Savings Rate (percentage)

   - Primary Account Card (DarkHeroCard):
     - Name, type, masked digits
     - Large balance
     - Card brand icon (if bank)

   - Budget Health Card:
     - "₹X spent of ₹Y"
     - Progress bar
     - Days remaining
     - Daily allowance tip

   - Accounts Panel:
     - List of active accounts with balances
     - "+ Add Account" button

   - Recent Transactions:
     - Last 5 transactions
     - TransactionRow component
     - "View All →" link to /transactions

   - Savings Goals Section:
     - Horizontal scroll of SavingsGoalCard
     - "+ Add goal" button

2. `apps/web/components/dashboard/StatCard.tsx`:
   - SurfaceCard
   - Label (text-small, muted)
   - Value (text-h1, mono)
   - Delta (text-xs, green/red with arrow)

3. `apps/web/components/layout/AppShell.tsx`:
   - Desktop: Sidebar (240px) + Main content
   - Mobile: Bottom nav (64px) + Main content
   - Sidebar items: Dashboard, Transactions, Accounts, Budgets, Settings
   - Bottom nav: Dashboard, Transactions, QuickAdd (center, elevated), Accounts, Settings
   - Active state: violet background for active item

4. `apps/web/components/layout/Sidebar.tsx`:
   - Prism logo at top
   - Navigation items with icons
   - User avatar + name at bottom
   - Logout button

5. `apps/web/components/layout/BottomNav.tsx`:
   - 5 items, center is QuickAdd (elevated, larger)
   - Active state: violet icon

## CONSTRAINTS
- Use AppShell on ALL dashboard-group pages
- QuickAddFAB opens QuickAddModal
- Stats computed from API (not hardcoded)
- Mobile: bottom nav fixed, content scrolls above it
- Desktop: sidebar fixed, content scrolls
- Light mode only

## VERIFICATION
1. Dashboard loads with real data from API
2. Stats cards show correct numbers
3. Primary account card shows correct balance
4. Recent transactions show last 5
5. Savings goals section shows all goals
6. Sidebar navigation works on desktop
7. Bottom nav works on mobile (360px)
8. QuickAddFAB opens modal
```

**Human Check:** Dashboard loads with real data. Navigation works on mobile and desktop. QuickAdd opens.

---

## Week 1 Exit Gate Checklist

Before proceeding to Week 2, ALL of these must be true:

### Auth
- [ ] Can register with email + password
- [ ] Receives email verification link
- [ ] Can verify email and be redirected to onboarding
- [ ] Cannot access app without verification
- [ ] Can log in with verified credentials
- [ ] Can reset password via email
- [ ] Auth pages render correctly on mobile

### Onboarding
- [ ] 4-step wizard works end-to-end
- [ ] Data preserved when going back/forward
- [ ] Skip button works for each step
- [ ] Success screen shows after Step 4
- [ ] Redirects to /dashboard after completion
- [ ] Profile, account, budget, transaction created in DB

### Accounts
- [ ] Can create Cash, Bank, Wallet, FD, Savings, Emergency accounts
- [ ] Balance is computed correctly (opening_balance + transactions)
- [ ] Can archive accounts (soft delete)
- [ ] Archived accounts hidden by default
- [ ] Can view account detail with transaction history
- [ ] Can edit account (except type)
- [ ] Eye toggle hides/shows all balances

### Savings Goals
- [ ] Can create MULTIPLE savings goals
- [ ] Circular progress shows correct percentage
- [ ] Status pills show correct colors (on_track/behind/at_risk)
- [ ] Can contribute to goals
- [ ] Goals appear on Dashboard
- [ ] Mobile horizontal scroll works

### Settings
- [ ] Can update profile (name, college)
- [ ] Email is read-only
- [ ] Notification preferences save
- [ ] CSV export works
- [ ] Delete account works with confirmation
- [ ] Responsive on mobile

### Dashboard
- [ ] Shows greeting with user's name
- [ ] Stats cards show correct data
- [ ] Primary account card displays
- [ ] Budget health shows
- [ ] Recent transactions list
- [ ] Savings goals section
- [ ] AppShell navigation works

---

## Week 1 Anti-Hallucination Checks

| # | AI Mistake | Your Correction |
|---|-----------|----------------|
| 1 | Create custom `users` table | Use `auth.users` from InsForge |
| 2 | Use `FLOAT` for money | `NUMERIC(12,2)` everywhere |
| 3 | Store `balance` as column | Computed from transactions only |
| 4 | Put JWT in localStorage | httpOnly cookie only |
| 5 | Use naive timestamps | `TIMESTAMPTZ` (UTC) |
| 6 | Hard-delete accounts | `is_archived` soft-delete |
| 7 | Allow type change after creation | Type is immutable |
| 8 | Limit savings goals to 1 | Multiple goals per user |
| 9 | Store goal status in DB | Status is computed on fetch |
| 10 | Skip RLS policies | Must enable on ALL user tables |
| 11 | Forget onboarding_completed flag | Must track in profiles table |
| 12 | Skip email verification | Required before app access |
| 13 | Use dark mode | Light mode per wireframe |

---

## Next: Week 2
Once Week 1 exit gate is passed, proceed to:
- **Week 2:** Transactions, Categories, Tags & Recurring Rules
- Read `WEEK2_CHECKLIST_v2.md` (to be generated after Week 1 approval)
