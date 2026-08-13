from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from app.dependencies import get_db, get_current_user
from app.schemas.recurring_rule import RecurringRuleCreate, RecurringRuleUpdate, RecurringRuleResponse
from app.services import recurring_service
import os

router = APIRouter(prefix="/recurring-rules", tags=["recurring-rules"])

@router.get("", response_model=List[RecurringRuleResponse])
async def read_rules(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await recurring_service.get_rules(db, user_id)

@router.get("/upcoming", response_model=List[RecurringRuleResponse])
async def get_upcoming_rules(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await recurring_service.get_upcoming(db, user_id)

@router.post("", response_model=RecurringRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(
    rule_in: RecurringRuleCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await recurring_service.create_rule(db, user_id, rule_in)

@router.patch("/{rule_id}", response_model=RecurringRuleResponse)
async def update_rule(
    rule_id: UUID,
    rule_in: RecurringRuleUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await recurring_service.update_rule(db, user_id, rule_id, rule_in)

@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rule(
    rule_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    await recurring_service.delete_rule(db, user_id, rule_id)

@router.post("/internal/generate")
async def generate_due_transactions(
    secret: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Internal endpoint to be called by Edge Function / cron job.
    Secured by a simple shared secret for MVP.
    """
    expected_secret = os.getenv("CRON_SECRET", "super-secret-cron-key")
    if secret != expected_secret:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    result = await recurring_service.generate_due_transactions(db)
    return result
