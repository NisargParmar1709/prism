# WEEK4_CHECKLIST_v2.md
## Prism — Week 4: CSV Export, PWA Offline Queue, Admin Skeleton

> **Duration:** 5 days (Days 1–5)
> **Goal:** User can export data as CSV, use app offline with sync queue, and admin dashboard skeleton exists.
> **Exit Gate:** CSV export works. Offline transaction queue stores and syncs. Admin /health and /metrics endpoints work.

---

## Pre-Reading
Read in order:
1. `PROJECT_CONTEXT_v2.md`
2. `AUTH_GUIDE.md`
3. `FINANCIAL_SAFETY_RULES.md`
4. `API_CONTRACT_v2.md` (Sections 14, 16, 17)

---

## Day 1: CSV Export

### Task 1.1: CSV Export Backend

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /API_CONTRACT_v2.md Section 17 (Data Export) and /FINANCIAL_SAFETY_RULES.md Rule 1.

## TASK
Build CSV export for transactions.

Create:
1. `apps/api/app/routers/export.py`:
   - GET /export/transactions.csv
   - Query params: start_date, end_date, account_id (optional)
   
2. CSV generation:
   ```python
   import csv
   import io
   from fastapi.responses import StreamingResponse
   
   @router.get("/export/transactions.csv")
   async def export_transactions(
       user_id: str = Depends(get_current_user),
       start_date: str = Query(...),
       end_date: str = Query(...),
       account_id: UUID | None = Query(None),
       db: AsyncSession = Depends(get_db)
   ):
       # Build query
       query = select(Transaction).where(
           Transaction.user_id == user_id,
           Transaction.date >= start_date,
           Transaction.date <= end_date,
           Transaction.deleted_at.is_(None)
       )
       if account_id:
           query = query.where(Transaction.account_id == account_id)
       
       result = await db.execute(query.order_by(Transaction.date.desc()))
       transactions = result.scalars().all()
       
       # Generate CSV
       output = io.StringIO()
       writer = csv.writer(output)
       writer.writerow(["date", "account", "category", "type", "amount", "note", "tags", "status"])
       
       for tx in transactions:
           writer.writerow([
               tx.date.isoformat(),
               tx.account.name,
               tx.category.name,
               tx.type,
               str(tx.amount),
               tx.note or "",
               ",".join(tx.tags or []),
               tx.status
           ])
       
       output.seek(0)
       return StreamingResponse(
           io.BytesIO(output.getvalue().encode()),
           media_type="text/csv",
           headers={"Content-Disposition": f"attachment; filename=prism_transactions_{start_date}_{end_date}.csv"}
       )
CONSTRAINTS
Amounts as strings in CSV (exact decimal)
Date format: ISO 8601
Tags joined with commas
RLS: only user's own transactions
Limit: Max 10,000 rows per export (prevent abuse)
VERIFICATION
Export returns valid CSV file
Amounts show exact values (no float drift)
Only user's transactions included
File download works in browser
Large export limited to 10k rows
plain

---

### Task 1.2: CSV Export UI

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md Page 10 (Settings — Data & Privacy section).

## TASK
Add CSV export to Settings page.

Update `apps/web/app/settings/page.tsx`:
- Add "Download my data as CSV" button in Data & Privacy section
- Click → show loading spinner
- After generation → auto-download starts
- Success toast: "Your data is ready"

Add date range picker:
- Default: Last 30 days
- Options: Last 7 days, Last 30 days, This Month, Last Month, Custom

## CONSTRAINTS
- Loading state during generation
- Error handling if export fails
- Mobile: full-width button
- Light mode only

## VERIFICATION
1. Click export → loading → download starts
2. CSV opens correctly in Excel/Sheets
3. Date range filter works
4. Error state shows if API fails
