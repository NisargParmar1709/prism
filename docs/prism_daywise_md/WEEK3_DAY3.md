## Day 3: Dashboard Aggregation API

### Task 3.1: Dashboard Backend

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /API_CONTRACT_v2.md Section 8 (Dashboard) and /PAGES_SPEC.md Page 01.

## TASK
Build the Dashboard aggregation API.

Create:
1. `apps/api/app/routers/dashboard.py`:
   - GET /dashboard → returns complete dashboard data

2. Aggregation queries:
   ```python
   async def get_dashboard_data(db, user_id: str, period: str):
       # Period: "2026-08"
       start_date = f"{period}-01"
       year, month = map(int, period.split("-"))
       if month == 12:
           end_date = f"{year + 1}-01-01"
       else:
           end_date = f"{year}-{month + 1:02d}-01"
       
       # Stats
       income_result = await db.execute(
           select(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
           .where(Transaction.user_id == user_id, Transaction.type == "income",
                  Transaction.date >= start_date, Transaction.date < end_date,
                  Transaction.deleted_at.is_(None))
       )
       income = income_result.scalar()
       
       expense_result = await db.execute(
           select(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
           .where(Transaction.user_id == user_id, Transaction.type == "expense",
                  Transaction.date >= start_date, Transaction.date < end_date,
                  Transaction.deleted_at.is_(None))
       )
       expense = expense_result.scalar()
       
       # Accounts with computed balances
       accounts = await get_accounts_with_balance(db, user_id)
       total_balance = sum(acc.current_balance for acc in accounts)
       
       # Budget health
       budgets = await get_budgets_with_spent(db, user_id, period)
       
       # Recent transactions (last 5)
       recent = await get_recent_transactions(db, user_id, limit=5)
       
       # Category distribution
       categories = await get_category_distribution(db, user_id, start_date, end_date)
       
       # Savings goals
       goals = await get_savings_goals(db, user_id)
       
       return {
           "greeting": get_greeting(),
           "date": datetime.now(timezone.utc).isoformat(),
           "period": period,
           "stats": {
               "total_balance": str(total_balance),
               "income_this_month": str(income),
               "spent_this_month": str(expense),
               "savings_rate": round((income - expense) / income * 100, 1) if income > 0 else 0
           },
           "accounts": accounts,
           "budget_health": budgets,
           "recent_transactions": recent,
           "category_distribution": categories,
           "savings_goals": goals
       }
Greeting logic:
Python
def get_greeting():
    hour = datetime.now(timezone.utc).hour
    if 5 <= hour < 12: return "Good morning"
    elif 12 <= hour < 17: return "Good afternoon"
    elif 17 <= hour < 21: return "Good evening"
    else: return "Good night"
CONSTRAINTS
All amounts returned as strings (not numbers) for exact decimal
Period format: YYYY-MM
Computed balances (not stored)
Exclude soft-deleted transactions
Limit recent transactions to 5
VERIFICATION
GET /dashboard returns complete data structure
Total balance matches sum of all account balances
Income/expense matches actual transactions
Category distribution sums to 100%
Savings goals show correct percentages
plain

---

