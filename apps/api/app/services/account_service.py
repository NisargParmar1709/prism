from uuid import UUID
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.account import AccountCreate, AccountUpdate

async def compute_balance(db: AsyncSession, account_id: UUID, user_id: UUID) -> Decimal:
    from sqlalchemy import case
    result = await db.execute(
        select(
            func.coalesce(
                func.sum(
                    case(
                        (Transaction.type == 'income', Transaction.amount),
                        (Transaction.type == 'expense', -Transaction.amount),
                        else_=Decimal('0')
                    )
                ), Decimal('0')
            )
        )
        .where(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.status == 'completed'
        )
    )
    transactions_sum = result.scalar()
    account = await db.execute(
        select(Account).where(Account.id == account_id, Account.user_id == user_id)
    )
    account = account.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return account.opening_balance + transactions_sum

async def create_account(db: AsyncSession, user_id: UUID, account_in: AccountCreate):
    db_account = Account(
        **account_in.model_dump(),
        user_id=user_id
    )
    db.add(db_account)
    await db.commit()
    await db.refresh(db_account)
    
    # Initialize current_balance to opening_balance for a new account
    db_account.current_balance = db_account.opening_balance
    return db_account

async def get_accounts(db: AsyncSession, user_id: UUID, include_archived: bool = False):
    query = select(Account).where(Account.user_id == user_id)
    if not include_archived:
        query = query.where(Account.is_archived == False)
        
    result = await db.execute(query)
    accounts = result.scalars().all()
    
    for account in accounts:
        account.current_balance = await compute_balance(db, account.id, user_id)
        
    return accounts

async def get_account(db: AsyncSession, user_id: UUID, account_id: UUID):
    account = await db.get(Account, account_id)
    if not account or account.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
        
    account.current_balance = await compute_balance(db, account.id, user_id)
    # Note: transactions would ideally be attached here or queried separately by the client
    return account

async def update_account(db: AsyncSession, user_id: UUID, account_id: UUID, account_in: AccountUpdate):
    account = await db.get(Account, account_id)
    if not account or account.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
        
    update_data = account_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)
        
    await db.commit()
    await db.refresh(account)
    
    account.current_balance = await compute_balance(db, account.id, user_id)
    return account

async def archive_account(db: AsyncSession, user_id: UUID, account_id: UUID):
    account = await db.get(Account, account_id)
    if not account or account.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
        
    account.is_archived = True
    await db.commit()

async def unarchive_account(db: AsyncSession, user_id: UUID, account_id: UUID):
    account = await db.get(Account, account_id)
    if not account or account.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
        
    account.is_archived = False
    await db.commit()
