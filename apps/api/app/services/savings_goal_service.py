import uuid
from decimal import Decimal
from datetime import date, datetime, timezone
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from ..models.savings_goal import SavingsGoal
from ..schemas.savings_goal import SavingsGoalCreate, SavingsGoalUpdate

def calculate_status(goal: SavingsGoal) -> str:
    if goal.deadline:
        today = datetime.now(timezone.utc).date()
        days_remaining = (goal.deadline - today).days
        if days_remaining <= 0:
            return "behind" if goal.current_amount < goal.target_amount else "on_track"
        months_remaining = max(1, days_remaining / 30.0)
        required_monthly = (goal.target_amount - goal.current_amount) / Decimal(str(months_remaining))
        if required_monthly <= goal.monthly_contribution * Decimal('0.8'):
            return "on_track"
        elif required_monthly <= goal.monthly_contribution * Decimal('1.2'):
            return "behind"
        else:
            return "at_risk"
    return "on_track"

def enrich_goal(goal: SavingsGoal) -> dict:
    percentage = 0
    if goal.target_amount > 0:
        percentage = int((goal.current_amount / goal.target_amount) * 100)
    
    # Cap at 100
    percentage = min(100, percentage)
    
    remaining = max(Decimal('0'), goal.target_amount - goal.current_amount)
    
    status_str = calculate_status(goal)
    
    goal_dict = {
        "id": goal.id,
        "user_id": goal.user_id,
        "name": goal.name,
        "icon": goal.icon,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "monthly_contribution": goal.monthly_contribution,
        "deadline": goal.deadline,
        "percentage": percentage,
        "remaining": remaining,
        "status": status_str
    }
    return goal_dict

async def create_goal(db: AsyncSession, user_id: uuid.UUID, data: SavingsGoalCreate) -> dict:
    new_goal = SavingsGoal(
        user_id=user_id,
        **data.model_dump()
    )
    db.add(new_goal)
    await db.commit()
    await db.refresh(new_goal)
    return enrich_goal(new_goal)

async def get_goals(db: AsyncSession, user_id: uuid.UUID) -> List[dict]:
    result = await db.execute(
        select(SavingsGoal).where(SavingsGoal.user_id == user_id)
    )
    goals = result.scalars().all()
    return [enrich_goal(g) for g in goals]

async def get_goal(db: AsyncSession, user_id: uuid.UUID, goal_id: uuid.UUID) -> dict:
    result = await db.execute(
        select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    return enrich_goal(goal)

async def update_goal(db: AsyncSession, user_id: uuid.UUID, goal_id: uuid.UUID, data: SavingsGoalUpdate) -> dict:
    result = await db.execute(
        select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)
        
    await db.commit()
    await db.refresh(goal)
    return enrich_goal(goal)

async def contribute(db: AsyncSession, user_id: uuid.UUID, goal_id: uuid.UUID, amount: Decimal) -> dict:
    result = await db.execute(
        select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    goal.current_amount += amount
    await db.commit()
    await db.refresh(goal)
    return enrich_goal(goal)

async def delete_goal(db: AsyncSession, user_id: uuid.UUID, goal_id: uuid.UUID) -> None:
    result = await db.execute(
        select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
        
    await db.delete(goal)
    await db.commit()
