from uuid import UUID
from decimal import Decimal
from typing import Optional, List
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc, asc, cast, String
from sqlalchemy.orm import joinedload
from fastapi import HTTPException, status
import math

from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
from app.schemas.transaction import (
    TransactionCreate, 
    TransactionUpdate, 
    TransactionResponse,
    PaginatedTransactionResponse,
    PaginationMeta,
    TransactionSummaryResponse
)
from app.services.account_service import compute_balance

async def create_transaction(db: AsyncSession, user_id: UUID, tx_in: TransactionCreate) -> TransactionResponse:
    # Validate account belongs to user
    account = await db.execute(select(Account).where(Account.id == tx_in.account_id, Account.user_id == user_id))
    account = account.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found or access denied")
        
    if tx_in.type == 'expense' and tx_in.status == 'completed':
        current_balance = await compute_balance(db, tx_in.account_id, user_id)
        if tx_in.amount > current_balance:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient funds")
            
    db_tx = Transaction(
        **tx_in.model_dump(),
        user_id=user_id
    )
    db.add(db_tx)
    await db.commit()
    
    # Recalculate balance for the account (this updates the account on the fly when requested)
    # The prompt mentions "return with computed balance", but TransactionResponse doesn't have balance.
    # The API Contract for POST /transactions says it returns the created transaction.
    
    return await get_transaction(db, user_id, db_tx.id)

async def get_transactions(
    db: AsyncSession, 
    user_id: UUID,
    page: int = 1,
    limit: int = 20,
    account_id: Optional[UUID] = None,
    category_id: Optional[UUID] = None,
    type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    tags: Optional[List[str]] = None,
    tx_status: Optional[str] = None,  # renamed from status to avoid shadow
    sort_by: str = "date",
    sort_order: str = "desc"
) -> PaginatedTransactionResponse:
    
    query = select(Transaction).join(Account).join(Category).where(
        Transaction.user_id == user_id,
        Transaction.deleted_at.is_(None)
    ).options(joinedload(Transaction.account), joinedload(Transaction.category))
    
    if account_id:
        query = query.where(Transaction.account_id == account_id)
    if category_id:
        query = query.where(Transaction.category_id == category_id)
    if type:
        query = query.where(Transaction.type == type)
    if start_date:
        query = query.where(Transaction.date >= start_date)
    if end_date:
        query = query.where(Transaction.date <= end_date)
    if tx_status:
        query = query.where(Transaction.status == tx_status)
    if tags:
        # postgresql overlap operator && 
        query = query.where(Transaction.tags.op('&&')(tags))
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Transaction.note.ilike(search_term),
                Category.name.ilike(search_term),
                cast(Transaction.tags, String).ilike(search_term)
            )
        )
        
    # Sorting
    sort_col = getattr(Transaction, sort_by, Transaction.date)
    if sort_order == "desc":
        query = query.order_by(desc(sort_col), desc(Transaction.created_at))
    else:
        query = query.order_by(asc(sort_col), asc(Transaction.created_at))
        
    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    data = []
    for tx in transactions:
        data.append(TransactionResponse(
            id=tx.id,
            account_id=tx.account_id,
            account_name=tx.account.name,
            account_type=tx.account.type.value if hasattr(tx.account.type, 'value') else tx.account.type,
            category_id=tx.category_id,
            category_name=tx.category.name,
            category_icon=tx.category.icon,
            type=tx.type,
            amount=tx.amount,
            date=tx.date,
            note=tx.note,
            tags=tx.tags,
            status=tx.status,
            payment_method=tx.payment_method,
            created_at=tx.created_at
        ))
        
    total_pages = math.ceil(total / limit) if total > 0 else 1
    meta = PaginationMeta(
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1
    )
    
    return PaginatedTransactionResponse(data=data, meta=meta)

async def get_transaction(db: AsyncSession, user_id: UUID, tx_id: UUID) -> TransactionResponse:
    query = select(Transaction).join(Account).join(Category).where(
        Transaction.id == tx_id,
        Transaction.user_id == user_id,
        Transaction.deleted_at.is_(None)
    ).options(joinedload(Transaction.account), joinedload(Transaction.category))
    
    result = await db.execute(query)
    tx = result.scalar_one_or_none()
    
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
        
    return TransactionResponse(
        id=tx.id,
        account_id=tx.account_id,
        account_name=tx.account.name,
        account_type=tx.account.type.value if hasattr(tx.account.type, 'value') else tx.account.type,
        category_id=tx.category_id,
        category_name=tx.category.name,
        category_icon=tx.category.icon,
        type=tx.type,
        amount=tx.amount,
        date=tx.date,
        note=tx.note,
        tags=tx.tags,
        status=tx.status,
        payment_method=tx.payment_method,
        created_at=tx.created_at
    )

async def update_transaction(db: AsyncSession, user_id: UUID, tx_id: UUID, tx_in: TransactionUpdate) -> TransactionResponse:
    query = select(Transaction).where(
        Transaction.id == tx_id,
        Transaction.user_id == user_id,
        Transaction.deleted_at.is_(None)
    )
    result = await db.execute(query)
    tx = result.scalar_one_or_none()
    
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
        
    update_data = tx_in.model_dump(exclude_unset=True)
    # Ensure account_id and type cannot be changed
    if 'account_id' in update_data:
        del update_data['account_id']
    if 'type' in update_data:
        del update_data['type']
        
    # Check sufficient funds if this is an expense and it will be 'completed'
    new_status = update_data.get('status', tx.status)
    new_amount = update_data.get('amount', tx.amount)
    
    if tx.type == 'expense' and new_status == 'completed':
        # If it was pending, the whole amount is new to the balance
        # If it was completed, only the difference is new to the balance
        diff = new_amount if tx.status == 'pending' else (new_amount - tx.amount)
        
        if diff > 0:
            current_balance = await compute_balance(db, tx.account_id, user_id)
            if diff > current_balance:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient funds")
            
    for field, value in update_data.items():
        setattr(tx, field, value)
        
    await db.commit()
    
    return await get_transaction(db, user_id, tx.id)

async def delete_transaction(db: AsyncSession, user_id: UUID, tx_id: UUID):
    query = select(Transaction).where(
        Transaction.id == tx_id,
        Transaction.user_id == user_id,
        Transaction.deleted_at.is_(None)
    )
    result = await db.execute(query)
    tx = result.scalar_one_or_none()
    
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
        
    tx.deleted_at = func.now()
    await db.commit()

async def restore_transaction(db: AsyncSession, user_id: UUID, tx_id: UUID) -> TransactionResponse:
    query = select(Transaction).where(
        Transaction.id == tx_id,
        Transaction.user_id == user_id,
        Transaction.deleted_at.is_not(None)
    )
    result = await db.execute(query)
    tx = result.scalar_one_or_none()
    
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deleted transaction not found")
        
    if tx.type == 'expense' and tx.status == 'completed':
        current_balance = await compute_balance(db, tx.account_id, user_id)
        if tx.amount > current_balance:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient funds to restore this transaction")
            
    tx.deleted_at = None
    await db.commit()
    
    return await get_transaction(db, user_id, tx.id)

async def get_transaction_summary(db: AsyncSession, user_id: UUID, start_date: date, end_date: date) -> TransactionSummaryResponse:
    query = select(
        Transaction.type,
        func.coalesce(func.sum(Transaction.amount), Decimal('0'))
    ).where(
        Transaction.user_id == user_id,
        Transaction.deleted_at.is_(None),
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).group_by(Transaction.type)
    
    result = await db.execute(query)
    rows = result.all()
    
    income = Decimal('0')
    expense = Decimal('0')
    
    for row in rows:
        if row[0] == 'income':
            income = row[1]
        elif row[0] == 'expense':
            expense = row[1]
            
    net = income - expense
    
    return TransactionSummaryResponse(
        income_total=income,
        expense_total=expense,
        net=net
    )
