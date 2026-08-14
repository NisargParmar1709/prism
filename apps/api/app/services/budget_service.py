import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from datetime import date

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.category import Category

async def get_budget_spent(db: AsyncSession, user_id: uuid.UUID, category_id: uuid.UUID, period: str) -> Decimal:
    start_date = f"{period}-01"
    year, month = map(int, period.split("-"))
    if month == 12:
        end_date = f"{year + 1}-01-01"
    else:
        end_date = f"{year}-{month + 1:02d}-01"
    
    start_date_obj = date.fromisoformat(start_date)
    end_date_obj = date.fromisoformat(end_date)
    
    result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
        .where(
            Transaction.user_id == user_id,
            Transaction.category_id == category_id,
            Transaction.type == "expense",
            Transaction.date >= start_date_obj,
            Transaction.date < end_date_obj,
            Transaction.deleted_at.is_(None)
        )
    )
    return result.scalar()

async def create_budget(db: AsyncSession, user_id: uuid.UUID, category_id: uuid.UUID, amount: Decimal, period: str):
    if amount <= 0:
        raise HTTPException(status_code=422, detail="Amount must be greater than zero")
        
    budget = Budget(
        user_id=user_id,
        category_id=category_id,
        amount=amount,
        period=period
    )
    
    try:
        db.add(budget)
        await db.commit()
        await db.refresh(budget)
        return budget
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Budget already exists for this category and period")

def get_budget_status(spent: Decimal, amount: Decimal):
    pct = (spent / amount) * 100
    if pct >= 100:
        return "over_limit"
    if pct >= 80:
        return "warning"
    return "healthy"

async def get_budgets(db: AsyncSession, user_id: uuid.UUID, period: str):
    result = await db.execute(
        select(Budget, Category)
        .join(Category, Budget.category_id == Category.id)
        .where(Budget.user_id == user_id, Budget.period == period)
    )
    
    rows = result.all()
    budgets = []
    total_budgeted = Decimal("0")
    total_spent = Decimal("0")
    
    for budget, category in rows:
        spent = await get_budget_spent(db, user_id, budget.category_id, period)
        total_budgeted += budget.amount
        total_spent += spent
        
        remaining = budget.amount - spent
        percentage = min(round((spent / budget.amount) * 100, 1), 100) if budget.amount > 0 else 0
        status = get_budget_status(spent, budget.amount)
        
        budgets.append({
            "id": str(budget.id),
            "category_id": str(budget.category_id),
            "category_name": category.name,
            "category_icon": category.icon,
            "amount": str(budget.amount),
            "spent": str(spent),
            "remaining": str(remaining),
            "percentage": float(percentage),
            "status": status,
            "period": period
        })
        
    return {
        "data": budgets,
        "summary": {
            "total_budgeted": str(total_budgeted),
            "total_spent": str(total_spent),
            "total_remaining": str(total_budgeted - total_spent)
        }
    }

async def delete_budget(db: AsyncSession, user_id: uuid.UUID, budget_id: uuid.UUID):
    result = await db.execute(select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id))
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    await db.delete(budget)
    await db.commit()
    return True

async def update_budget(db: AsyncSession, user_id: uuid.UUID, budget_id: uuid.UUID, amount: Decimal):
    if amount <= 0:
        raise HTTPException(status_code=422, detail="Amount must be greater than zero")
        
    result = await db.execute(select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id))
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    budget.amount = amount
    await db.commit()
    await db.refresh(budget)
    return budget
