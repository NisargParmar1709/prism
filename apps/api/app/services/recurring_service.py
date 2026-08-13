from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from fastapi import HTTPException, status
from decimal import Decimal
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.postgresql import insert

from app.models.recurring_rule import RecurringRule
from app.models.transaction import Transaction
from app.models.account import Account
from app.schemas.recurring_rule import RecurringRuleCreate, RecurringRuleUpdate

def calculate_next_run(start_date: date, frequency: str, current_date: date) -> date:
    """
    Calculate the next run date based on frequency and current date.
    If the rule hasn't started yet, the next run is the start date.
    Otherwise, we calculate the next occurrence after current_date.
    """
    if current_date < start_date:
        return start_date

    # Find next occurrence strictly greater than current_date
    delta = None
    if frequency == "daily":
        delta = relativedelta(days=1)
    elif frequency == "weekly":
        delta = relativedelta(weeks=1)
    elif frequency == "biweekly":
        delta = relativedelta(weeks=2)
    elif frequency == "monthly":
        delta = relativedelta(months=1)
    elif frequency == "quarterly":
        delta = relativedelta(months=3)
    elif frequency == "yearly":
        delta = relativedelta(years=1)
    else:
        raise ValueError(f"Invalid frequency: {frequency}")

    # Start from start_date and keep adding delta until it's > current_date
    # For optimization on long running rules, we could do math, but relativedelta loops internally anyway for complex dates.
    next_date = start_date
    while next_date <= current_date:
        next_date += delta
        
    return next_date

async def create_rule(db: AsyncSession, user_id: UUID, rule_in: RecurringRuleCreate) -> RecurringRule:
    # Validate account ownership
    account = await db.scalar(select(Account).where(Account.id == rule_in.account_id, Account.user_id == user_id))
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    today = datetime.now().date()
    # Initial next_run is either start_date (if in future/today) or calculated
    if today < rule_in.start_date:
        next_run = rule_in.start_date
    else:
        # if start date is in the past, when is the next run? 
        # If it's today, we might want to schedule it for today. 
        # The prompt logic says: generate transactions where next_run <= today.
        # If start_date == today, we set next_run = today, it will be generated immediately on next cron tick.
        # But for calculation simplicity, if it's already started, let's just use start_date and let the cron catch it up.
        # The while loop in generate_due_transactions will advance it.
        next_run = rule_in.start_date

    rule = RecurringRule(
        user_id=user_id,
        **rule_in.model_dump(),
        next_run=next_run
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule

async def update_rule(db: AsyncSession, user_id: UUID, rule_id: UUID, rule_in: RecurringRuleUpdate) -> RecurringRule:
    rule = await db.scalar(select(RecurringRule).where(RecurringRule.id == rule_id, RecurringRule.user_id == user_id))
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")

    update_data = rule_in.model_dump(exclude_unset=True)
    
    # If frequency is updated, we should recalculate next_run based on start_date
    recalculate = False
    if "frequency" in update_data and update_data["frequency"] != rule.frequency:
        recalculate = True

    for field, value in update_data.items():
        setattr(rule, field, value)

    if recalculate:
        today = datetime.now().date()
        rule.next_run = calculate_next_run(rule.start_date, rule.frequency, today - relativedelta(days=1))
        # If we subtract 1 day from today, calculate_next_run will return >= today.

    await db.commit()
    await db.refresh(rule)
    return rule

async def delete_rule(db: AsyncSession, user_id: UUID, rule_id: UUID):
    rule = await db.scalar(select(RecurringRule).where(RecurringRule.id == rule_id, RecurringRule.user_id == user_id))
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    
    rule.is_active = False
    await db.commit()

async def get_rules(db: AsyncSession, user_id: UUID):
    result = await db.execute(select(RecurringRule).where(RecurringRule.user_id == user_id, RecurringRule.is_active == True))
    return result.scalars().all()

async def get_upcoming(db: AsyncSession, user_id: UUID):
    result = await db.execute(
        select(RecurringRule)
        .where(RecurringRule.user_id == user_id, RecurringRule.is_active == True)
        .order_by(RecurringRule.next_run)
        .limit(5)
    )
    return result.scalars().all()

async def generate_due_transactions(db: AsyncSession):
    today = datetime.now().date()
    
    # Fetch all active rules due today or earlier
    result = await db.execute(
        select(RecurringRule)
        .where(RecurringRule.is_active == True)
        .where(RecurringRule.next_run <= today)
    )
    rules = result.scalars().all()
    
    generated_count = 0

    for rule in rules:
        # Check if rule has expired
        if rule.end_date and rule.next_run > rule.end_date:
            rule.is_active = False
            continue

        # Create a transaction
        stmt = insert(Transaction).values(
            user_id=rule.user_id,
            account_id=rule.account_id,
            category_id=rule.category_id,
            type=rule.type,
            amount=rule.amount,
            date=rule.next_run,
            note=f"{rule.note or 'Recurring'} (Auto-generated)",
            recurring_rule_id=rule.id,
            scheduled_date=rule.next_run,
            status="completed"
        ).on_conflict_do_nothing(
            index_elements=["recurring_rule_id", "scheduled_date"]
        )
        
        # Execute insert
        res = await db.execute(stmt)
        
        if res.rowcount > 0:
            generated_count += 1
            # Update account balance
            account = await db.scalar(select(Account).where(Account.id == rule.account_id))
            if account:
                if rule.type == 'income':
                    account.current_balance += rule.amount
                else:
                    account.current_balance -= rule.amount

        # Update next_run for the rule
        rule.next_run = calculate_next_run(rule.start_date, rule.frequency, rule.next_run)
        
        # If the newly calculated next_run is past end_date, disable rule
        if rule.end_date and rule.next_run > rule.end_date:
            rule.is_active = False

    await db.commit()
    return {"generated": generated_count}
