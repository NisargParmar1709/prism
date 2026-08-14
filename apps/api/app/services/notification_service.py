import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from fastapi import HTTPException
from sqlalchemy.orm import joinedload

from app.models.notification import Notification
from app.models.budget import Budget
from app.models.category import Category
from app.services.budget_service import get_budget_spent

async def create_notification(
    db: AsyncSession, 
    user_id: uuid.UUID, 
    type: str, 
    title: str, 
    message: str, 
    action_url: Optional[str] = None
) -> Notification:
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        action_url=action_url
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification

async def get_notifications(db: AsyncSession, user_id: uuid.UUID, unread_only: bool = False):
    query = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    if unread_only:
        query = query.where(Notification.is_read == False)
        
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    # Get unread count
    count_query = select(func.count()).select_from(Notification).where(
        Notification.user_id == user_id,
        Notification.is_read == False
    )
    count_result = await db.execute(count_query)
    unread_count = count_result.scalar() or 0
    
    return {
        "data": notifications,
        "unread_count": unread_count
    }

async def mark_read(db: AsyncSession, user_id: uuid.UUID, notification_id: uuid.UUID):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification

async def mark_all_read(db: AsyncSession, user_id: uuid.UUID):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()
    return True

async def check_budget_alerts(db: AsyncSession, user_id: uuid.UUID, category_id: uuid.UUID, period: str):
    # Fetch the budget for this category and period
    result = await db.execute(
        select(Budget).options(joinedload(Budget.category)).where(
            Budget.user_id == user_id,
            Budget.category_id == category_id,
            Budget.period == period
        )
    )
    budget = result.scalar_one_or_none()
    
    if not budget or budget.amount <= 0:
        return
        
    spent = await get_budget_spent(db, user_id, category_id, period)
    percentage = (spent / budget.amount) * 100
    
    if percentage >= 100 and budget.last_alert_percentage < 100:
        await create_notification(
            db=db,
            user_id=user_id,
            type="budget_exceeded",
            title=f"Budget Exceeded: {budget.category.name}",
            message=f"You've exceeded your {budget.category.name} budget of ₹{budget.amount}",
            action_url="/budgets"
        )
        budget.last_alert_percentage = 100
        await db.commit()
        
    elif percentage >= 80 and budget.last_alert_percentage < 80:
        await create_notification(
            db=db,
            user_id=user_id,
            type="budget_warning",
            title=f"Budget Warning: {budget.category.name}",
            message=f"You've used {percentage:.0f}% of your {budget.category.name} budget",
            action_url="/budgets"
        )
        budget.last_alert_percentage = 80
        await db.commit()
