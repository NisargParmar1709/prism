## Day 4: Admin Skeleton

### Task 4.1: Admin Dashboard Backend

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /API_CONTRACT_v2.md Section 16 (Admin Endpoints) and /AUTH_GUIDE.md (Admin Auth).

## TASK
Build admin dashboard skeleton.

Create:
1. `apps/api/app/routers/admin.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_admin_user

router = APIRouter(prefix="/admin", dependencies=[Depends(get_admin_user)])

@router.get("/health")
async def admin_health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

@router.get("/metrics")
async def admin_metrics(db: AsyncSession = Depends(get_db)):
    # Aggregate counts only — NO financial data
    total_users = await db.execute(select(func.count()).select_from(text("auth.users")))
    total_transactions = await db.execute(select(func.count(Transaction.id)))
    active_users_7d = await db.execute(
        select(func.count(func.distinct(Transaction.user_id)))
        .where(Transaction.created_at >= datetime.now(timezone.utc) - timedelta(days=7))
    )
    
    return {
        "total_users": total_users.scalar(),
        "total_transactions": total_transactions.scalar(),
        "active_users_7d": active_users_7d.scalar(),
        "new_signups_today": 0,  # Placeholder
        "last_sync_at": datetime.now(timezone.utc).isoformat()
    }

@router.get("/users")
async def admin_users(
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    # Return non-financial user data only
    result = await db.execute(
        select(Profile)
        .order_by(Profile.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    users = result.scalars().all()
    return {
        "data": [{"id": u.user_id, "name": u.full_name, "college": u.college, "created_at": u.created_at} for u in users],
        "meta": {"page": page, "limit": limit, "total": len(users)}
    }

@router.post("/users/{user_id}/suspend")
async def suspend_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    # Placeholder for suspend logic
    return {"status": "suspended", "user_id": str(user_id)}
Admin sync job (InsForge Edge Function):
Runs every 15 minutes
Syncs aggregate metrics from User DB to Admin DB
Logs execution to sync_runs table
CONSTRAINTS
Admin endpoints use separate auth (ADMIN_SECRET_KEY)
NO financial data in admin responses
Only aggregate counts
RLS on admin tables
Sync job is read-only from user DB
VERIFICATION
Admin /metrics returns counts (no amounts)
Admin /users returns names only (no balances)
User JWT rejected on admin endpoints
Admin JWT rejected on user endpoints
Sync job runs and logs execution
plain

---

