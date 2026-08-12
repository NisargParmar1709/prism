import uuid
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db, get_current_user
from ..schemas.savings_goal import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse, SavingsGoalContribute
from ..services import savings_goal_service

router = APIRouter(prefix="/savings-goals", tags=["savings-goals"])

@router.get("", response_model=list[SavingsGoalResponse])
async def list_savings_goals(
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
):
    return await savings_goal_service.get_goals(db, user_id)

@router.post("", response_model=SavingsGoalResponse, status_code=201)
async def create_savings_goal(
    data: SavingsGoalCreate,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
) -> Any:
    return await savings_goal_service.create_goal(db, user_id, data)

@router.get("/{id}", response_model=SavingsGoalResponse)
async def get_savings_goal(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
) -> Any:
    return await savings_goal_service.get_goal(db, user_id, id)

@router.patch("/{id}", response_model=SavingsGoalResponse)
async def update_savings_goal(
    id: uuid.UUID,
    data: SavingsGoalUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
) -> Any:
    return await savings_goal_service.update_goal(db, user_id, id, data)

@router.patch("/{id}/contribute", response_model=SavingsGoalResponse)
async def contribute_to_savings_goal(
    id: uuid.UUID,
    data: SavingsGoalContribute,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
) -> Any:
    return await savings_goal_service.contribute(db, user_id, id, data.amount)

@router.delete("/{id}", status_code=204)
async def delete_savings_goal(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
):
    await savings_goal_service.delete_goal(db, user_id, id)
