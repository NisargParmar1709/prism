# WEEK3_CHECKLIST_v2.md
## Prism — Week 3: Budgets, Dashboard Aggregation & Notifications

> **Duration:** 5 days (Days 1–5)
> **Goal:** User can set budgets, get alerts at 80% and 100%, see a real dashboard with aggregated data, and receive in-app notifications.
> **Exit Gate:** Budget alerts fire when thresholds are crossed. Dashboard shows real computed data. Notifications appear for budget events.

---

## Pre-Reading
Read in order:
1. `PROJECT_CONTEXT_v2.md`
2. `AUTH_GUIDE.md`
3. `FINANCIAL_SAFETY_RULES.md`
4. `API_CONTRACT_v2.md` (Sections 7, 8, 13)
5. `PAGES_SPEC.md` (Pages 01, 05)

---

## Day 1: CRITICAL FIX (Task 0) + Budgets Backend

### Task 0: Fix CORS & Admin Auth Separation (CRITICAL — Audit Bugs #6, #9, #10)

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /FINANCIAL_SAFETY_RULES.md Rules 8, 9, 10 and audit findings.

## TASK
Fix three critical security issues from the audit.

1. **Fix CORS (apps/api/app/main.py):**
   Current (WRONG):
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # NEVER in production
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
Fix to:
Python
   from app.config import settings
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=settings.allowed_origins,  # From env: ["http://localhost:3000", "https://prism-web.vercel.app"]
       allow_credentials=True,
       allow_methods=["GET", "POST", "PATCH", "DELETE"],
       allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
   )
Separate Admin Auth (apps/api/app/dependencies.py):
Current (WRONG): Admin routes use same get_current_user as user routes.
Fix: Create separate admin dependency:
Python
async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=["HS256"])
        admin_id = payload.get("sub")
        if not admin_id:
            raise HTTPException(403, "Invalid admin token")
        return admin_id
    except jwt.InvalidTokenError:
        raise HTTPException(403, "Invalid admin credentials")
Create admin router with prefix /admin that uses get_admin_user.
Add Request ID Logging:
Python
# In middleware
request_id = str(uuid4())
response.headers["X-Request-ID"] = request_id
# Log: {request_id, method, path, user_id, duration_ms, status}
CONSTRAINTS
CORS origins from environment variable (comma-separated)
Admin auth uses ADMIN_SECRET_KEY, not INSFORGE_JWT_SECRET
Request ID in every response header
JSON structured logging
VERIFICATION
CORS blocks requests from unauthorized origins
Admin endpoint rejects user JWT
User endpoint rejects admin JWT
Every response has X-Request-ID header
Logs include request_id for tracing
plain

---

### Task 1.1: Budgets Backend

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /API_CONTRACT_v2.md Section 7 (Budgets) and /FINANCIAL_SAFETY_RULES.md Rule 1.

## TASK
Build the complete Budget engine.

Create:
1. `apps/api/app/models/budget.py`:
```python
class Budget(Base):
    __tablename__ = "budgets"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(index=True)
    category_id: Mapped[UUID] = mapped_column(ForeignKey("categories.id"))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    period: Mapped[str] = mapped_column(String(7), nullable=False)  # "2026-08" format
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    category: Mapped["Category"] = relationship("Category")
apps/api/app/services/budget_service.py:
create_budget(user_id, category_id, amount, period)
get_budgets(user_id, period) → with spent calculation
get_budget_health(user_id, period) → overall summary
check_budget_thresholds(user_id, period) → triggers alerts
delete_budget(user_id, budget_id)
Spent calculation:
Python
async def get_budget_spent(db, user_id, category_id, period):
    start_date = f"{period}-01"
    # Calculate end of month
    year, month = map(int, period.split("-"))
    if month == 12:
        end_date = f"{year + 1}-01-01"
    else:
        end_date = f"{year}-{month + 1:02d}-01"
    
    result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
        .where(
            Transaction.user_id == user_id,
            Transaction.category_id == category_id,
            Transaction.type == "expense",
            Transaction.date >= start_date,
            Transaction.date < end_date,
            Transaction.deleted_at.is_(None)
        )
    )
    return result.scalar()
apps/api/app/routers/budgets.py:
GET /budgets?period=2026-08
POST /budgets
DELETE /budgets/{id}
Budget status logic:
healthy: < 80%
warning: 80-99%
over_limit: ≥ 100%
CONSTRAINTS
One budget per category per period
Amount > 0
Period format: YYYY-MM
Spent calculated from actual transactions (not cached for v1)
Alert triggers: 80% and 100% thresholds
VERIFICATION
Create budget ₹7000 for Food in August
Add ₹5600 expense in Food → status = warning (80%)
Add ₹1500 more → status = over_limit (101%)
GET /budgets returns correct spent, remaining, percentage, status
Cannot create duplicate budget for same category+period
plain

---

