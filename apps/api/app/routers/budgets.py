from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from pydantic import BaseModel, Field
from decimal import Decimal
import uuid
import re

from app.dependencies import get_db, get_current_user
from app.services.budget_service import create_budget, get_budgets, delete_budget

router = APIRouter(
    prefix="/budgets",
    tags=["budgets"]
)

class BudgetCreate(BaseModel):
    category_id: uuid.UUID
    amount: Decimal = Field(..., gt=0, decimal_places=2, max_digits=12)
    period: str = Field(..., pattern=r"^\d{4}-\d{2}$") # YYYY-MM

@router.get("")
async def get_all_budgets(
    period: str,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
):
    if not re.match(r"^\d{4}-\d{2}$", period):
        raise HTTPException(status_code=422, detail="Invalid period format, expected YYYY-MM")
    
    return await get_budgets(db, user_id, period)

@router.post("", status_code=201)
async def create_new_budget(
    budget_in: BudgetCreate,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
):
    budget = await create_budget(
        db=db,
        user_id=user_id,
        category_id=budget_in.category_id,
        amount=budget_in.amount,
        period=budget_in.period
    )
    return {
        "id": str(budget.id),
        "category_id": str(budget.category_id),
        "amount": str(budget.amount),
        "period": budget.period,
        "created_at": budget.created_at.isoformat()
    }

@router.delete("/{budget_id}")
async def delete_existing_budget(
    budget_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
):
    await delete_budget(db, user_id, budget_id)
    return {"message": "Budget deleted successfully"}

class BudgetUpdate(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2, max_digits=12)

@router.put("/{budget_id}")
async def update_existing_budget(
    budget_id: uuid.UUID,
    budget_in: BudgetUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user)
):
    from app.services.budget_service import update_budget
    budget = await update_budget(db, user_id, budget_id, budget_in.amount)
    return {
        "id": str(budget.id),
        "category_id": str(budget.category_id),
        "amount": str(budget.amount),
        "period": budget.period,
        "created_at": budget.created_at.isoformat()
    }
