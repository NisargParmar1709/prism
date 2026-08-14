from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from datetime import datetime, timezone

from app.dependencies import get_db, get_current_user
from app.schemas.dashboard import DashboardResponse
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    period: Optional[str] = Query(None, description="Format YYYY-MM. Defaults to current month."),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    if not period:
        period = datetime.now(timezone.utc).strftime("%Y-%m")
        
    return await dashboard_service.get_dashboard_data(db, user_id, period)
