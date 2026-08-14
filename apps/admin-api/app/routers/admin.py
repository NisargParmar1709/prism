from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime, timezone, timedelta
from app.dependencies import get_admin_user
from app.database import get_db

router = APIRouter(prefix="/admin", dependencies=[Depends(get_admin_user)])

@router.get("/health")
async def admin_health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

@router.get("/metrics")
async def admin_metrics(db: AsyncSession = Depends(get_db)):
    # Aggregate counts only — NO financial data
    total_users = await db.execute(select(func.count()).select_from(text("auth.users")))
    total_transactions = await db.execute(select(func.count()).select_from(text("transactions")))
    
    # Active users last 7 days
    active_users_query = text("""
        SELECT COUNT(DISTINCT user_id) 
        FROM transactions 
        WHERE created_at >= :date
    """)
    active_users_7d = await db.execute(
        active_users_query, 
        {"date": datetime.now(timezone.utc) - timedelta(days=7)}
    )
    
    return {
        "total_users": total_users.scalar() or 0,
        "total_transactions": total_transactions.scalar() or 0,
        "active_users_7d": active_users_7d.scalar() or 0,
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
    users_query = text("""
        SELECT user_id, full_name, college, created_at 
        FROM profiles 
        ORDER BY created_at DESC 
        OFFSET :offset LIMIT :limit
    """)
    result = await db.execute(
        users_query,
        {"offset": (page - 1) * limit, "limit": limit}
    )
    users = result.fetchall()
    
    total_query = await db.execute(select(func.count()).select_from(text("profiles")))
    total = total_query.scalar() or 0
    
    return {
        "data": [{"id": u.user_id, "name": u.full_name, "college": u.college, "created_at": u.created_at} for u in users],
        "meta": {"page": page, "limit": limit, "total": total}
    }
