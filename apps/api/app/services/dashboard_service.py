from uuid import UUID
from datetime import datetime, timezone, date
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.transaction import Transaction
from app.models.category import Category
from app.services.account_service import get_accounts
from app.services.budget_service import get_budgets
from app.services.transaction_service import get_transactions
from app.services.savings_goal_service import get_goals

def get_greeting():
    hour = datetime.now(timezone.utc).hour
    if 5 <= hour < 12: return "Good morning"
    elif 12 <= hour < 17: return "Good afternoon"
    elif 17 <= hour < 21: return "Good evening"
    else: return "Good night"

async def get_category_distribution(db: AsyncSession, user_id: UUID, start_date: str, end_date: str):
    start_date_obj = date.fromisoformat(start_date)
    end_date_obj = date.fromisoformat(end_date)
    
    query = select(
        Category.id,
        Category.name,
        Category.icon,
        func.coalesce(func.sum(Transaction.amount), Decimal("0")).label("amount")
    ).join(
        Transaction, Category.id == Transaction.category_id
    ).where(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_date_obj,
        Transaction.date < end_date_obj,
        Transaction.deleted_at.is_(None)
    ).group_by(
        Category.id
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    total_expense = sum(row.amount for row in rows)
    distribution = []
    
    for row in rows:
        percentage = round((row.amount / total_expense) * 100, 1) if total_expense > 0 else 0.0
        distribution.append({
            "category_id": str(row.id),
            "category_name": row.name,
            "category_icon": row.icon,
            "amount": str(row.amount),
            "percentage": percentage
        })
        
    # Sort descending by amount
    distribution.sort(key=lambda x: Decimal(x["amount"]), reverse=True)
    return distribution

async def get_dashboard_data(db: AsyncSession, user_id: UUID, period: str):
    start_date = f"{period}-01"
    year, month = map(int, period.split("-"))
    if month == 12:
        end_date = f"{year + 1}-01-01"
    else:
        end_date = f"{year}-{month + 1:02d}-01"
        
    # Stats
    income_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
        .where(Transaction.user_id == user_id, Transaction.type == "income",
               Transaction.date >= date.fromisoformat(start_date), Transaction.date < date.fromisoformat(end_date),
               Transaction.deleted_at.is_(None))
    )
    income = income_result.scalar() or Decimal("0")
    
    expense_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
        .where(Transaction.user_id == user_id, Transaction.type == "expense",
               Transaction.date >= date.fromisoformat(start_date), Transaction.date < date.fromisoformat(end_date),
               Transaction.deleted_at.is_(None))
    )
    expense = expense_result.scalar() or Decimal("0")
    
    # Accounts
    accounts = await get_accounts(db, user_id)
    total_balance = sum(acc.current_balance for acc in accounts)
    
    # Budget health
    budgets = await get_budgets(db, user_id, period)
    
    # Recent transactions
    # Note: get_transactions returns a PaginatedTransactionResponse object
    # Pydantic models will need to be dictized or returned as-is
    recent_response = await get_transactions(db, user_id, limit=5, sort_by="date", sort_order="desc")
    
    # Category distribution
    categories = await get_category_distribution(db, user_id, start_date, end_date)
    
    # Savings goals
    goals = await get_goals(db, user_id)
    
    savings_rate = round((income - expense) / income * 100, 1) if income > 0 else 0.0
    
    return {
        "greeting": get_greeting(),
        "date": datetime.now(timezone.utc),
        "period": period,
        "stats": {
            "total_balance": str(total_balance),
            "income_this_month": str(income),
            "spent_this_month": str(expense),
            "savings_rate": float(savings_rate)
        },
        "accounts": [
            {
                "id": str(acc.id),
                "name": acc.name,
                "type": acc.type.value if hasattr(acc.type, 'value') else acc.type,
                "current_balance": str(acc.current_balance),
                "currency": acc.currency
            } for acc in accounts
        ],
        "budget_health": budgets,
        "recent_transactions": recent_response.model_dump(),
        "category_distribution": categories,
        "savings_goals": goals
    }
