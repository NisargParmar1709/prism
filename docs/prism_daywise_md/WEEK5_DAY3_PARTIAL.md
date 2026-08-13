Day 3: AI Monthly Summary
Task 3.1: AI Summary Backend
AntiGravity Prompt:
Markdown
Copy
Code
Preview
## CONTEXT
Read /API_CONTRACT_v2.md Section 10 (AI Features) and /FINANCIAL_SAFETY_RULES.md Rule 7 (SQL-first).

## TASK
Build AI monthly summary generation.

Create:
1. `apps/api/app/routers/ai.py`:
   - POST /ai/summary
   - Request: { "period": "2026-08" }

2. SQL-first approach:
   ```python
   async def generate_monthly_summary(db, user_id, period):
       # 1. Gather aggregated data via SQL (NOT raw transactions)
       start_date = f"{period}-01"
       year, month = map(int, period.split("-"))
       if month == 12:
           end_date = f"{year + 1}-01-01"
       else:
           end_date = f"{year}-{month + 1:02d}-01"
       
       # Total income/expense
       income = await get_total(db, user_id, "income", start_date, end_date)
       expense = await get_total(db, user_id, "expense", start_date, end_date)
       
       # Top spending category
       top_category = await db.execute(
           select(Category.name, func.sum(Transaction.amount))
           .join(Transaction)
           .where(Transaction.user_id == user_id, Transaction.type == "expense",
                  Transaction.date >= start_date, Transaction.date < end_date)
           .group_by(Category.name)
           .order_by(func.sum(Transaction.amount).desc())
           .limit(1)
       )
       top_cat = top_category.first()
       
       # Month-over-month change
       prev_start = (datetime.strptime(start_date, "%Y-%m-%d") - timedelta(days=30)).strftime("%Y-%m-%d")
       prev_end = start_date
       prev_expense = await get_total(db, user_id, "expense", prev_start, prev_end)
       
       change_pct = ((expense - prev_expense) / prev_expense * 100) if prev_expense > 0 else 0
       
       # 2. Send ONLY aggregated data to LLM
       prompt = f"""
       You are a financial assistant. Analyze this spending summary and provide insights.
       
       Period: {
