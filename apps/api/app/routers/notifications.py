from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

from app.dependencies import get_db, get_current_user
from app.schemas.notification import NotificationResponse, NotificationListResponse
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=NotificationListResponse)
async def read_notifications(
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await notification_service.get_notifications(db, user_id, unread_only)

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await notification_service.mark_read(db, user_id, notification_id)

@router.patch("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    await notification_service.mark_all_read(db, user_id)
    return {"message": "All notifications marked as read"}
