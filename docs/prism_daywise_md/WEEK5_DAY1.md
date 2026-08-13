# WEEK5_CHECKLIST_v2.md
## Prism — Week 5: Analytics, AI Summary & Natural Language Queries

> **Duration:** 5 days (Days 1–5)
> **Goal:** User can view spending analytics (Overview/Spending/Trends tabs), get AI-generated monthly summaries, and ask natural language questions about their money.
> **Exit Gate:** Analytics page renders 3 tabs with real data. AI summary generates from actual transactions. NLQ answers questions with verified SQL.

---

## Pre-Reading
Read in order:
1. `PROJECT_CONTEXT_v2.md`
2. `AUTH_GUIDE.md`
3. `FINANCIAL_SAFETY_RULES.md` (Rules 7, 10 — AI features)
4. `API_CONTRACT_v2.md` (Sections 9, 10)
5. `PAGES_SPEC.md` (Pages 06, 07)

---

## Day 1: Analytics Backend

### Task 1.1: Analytics Aggregation APIs

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /API_CONTRACT_v2.md Section 9 (Analytics).

## TASK
Build analytics aggregation endpoints.

Create:
1. `apps/api/app/routers/analytics.py`:
   - GET /analytics/overview?period=6months&account_id=
   - GET /analytics/spending?period=month
   - GET /analytics/trends?period=month

2. Overview endpoint:
   ```python
   async def get_analytics_overview(db, user_id, period_months=6):
       end_date = datetime.now(timezone.utc)
       start_date = end_date - timedelta(days=30 * period_months)
       
       # Monthly income vs expense
       monthly_data = []
       for i in range(period_months):
           month_start = end_date - timedelta(days=30 * (i + 1))
           month_end = end_date - timedelta(days=30 * i)
           
           income = await get_monthly_total(db, user_id, "income", month_start, month_end)
           expense = await get_monthly_total(db, user_id, "expense", month_start, month_end)
           
           monthly_data.append({
               "month": month_start.strftime("%b %Y"),
               "income": str(income),
               "expense": str(expense)
           })
       
       # Spending breakdown by category
       categories = await db.execute(
           select(Category.name, func.sum(Transaction.amount))
           .join(Transaction, Transaction.category_id == Category.id)
           .where(
               Transaction.user_id == user_id,
               Transaction.type == "expense",
               Transaction.date >= start_date,
               Transaction.deleted_at.is_(None)
           )
           .group_by(Category.name)
           .order_by(func.sum(Transaction.amount).desc())
       )
       
       total_spent = sum(float(c[1]) for c in categories.all())
       breakdown = [
           {
               "category": c[0],
               "amount": str(c[1]),
               "percentage": round(float(c[1]) / total_spent * 100, 1)
           }
           for c in categories.all()
       ]
       
       return {
           "period": f"{period_months}months",
           "income_vs_expense": list(reversed(monthly_data)),
           "spending_breakdown": breakdown,
           "top_categories": breakdown[:5]
       }
Spending endpoint:
Group by category
Include transactions per category
Expandable in UI
Trends endpoint:
Daily spending for current month
Daily spending for previous month (comparison)
Return as arrays for line chart
CONSTRAINTS
All amounts as strings
Period: "month", "3months", "6months", "year"
Exclude soft-deleted transactions
Cache results in Redis for 5 minutes (v1.1 optimization)
VERIFICATION
Overview returns 6 months of data
Spending breakdown percentages sum to ~100%
Trends shows daily data for current and previous month
All data matches actual transactions
plain

---

