from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from typing import List
from uuid import UUID

from app.dependencies import get_current_user

router = APIRouter(prefix="/settings/notifications", tags=["settings"])

class NotificationPreference(BaseModel):
    alert_type: str
    email: bool
    in_app: bool

class NotificationPreferences(BaseModel):
    preferences: List[NotificationPreference]

# Mock data
MOCK_PREFERENCES = [
    {"alert_type": "budget_80", "email": True, "in_app": True},
    {"alert_type": "budget_exceeded", "email": True, "in_app": True},
    {"alert_type": "low_balance", "email": True, "in_app": False},
    {"alert_type": "recurring_reminder", "email": False, "in_app": True},
    {"alert_type": "weekly_summary", "email": True, "in_app": False},
    {"alert_type": "ai_insights", "email": False, "in_app": True}
]

@router.get("", response_model=NotificationPreferences)
async def get_notification_preferences(
    user_id: UUID = Depends(get_current_user)
):
    return {"preferences": MOCK_PREFERENCES}

@router.patch("")
async def update_notification_preferences(
    data: NotificationPreferences,
    user_id: UUID = Depends(get_current_user)
):
    # In a real app, this would persist to the DB. For now, just return success.
    return {"message": "Preferences updated successfully"}
