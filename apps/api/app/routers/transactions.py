from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional, List
from datetime import date

from app.dependencies import get_db, get_current_user
from app.schemas.transaction import (
    TransactionCreate, 
    TransactionUpdate, 
    TransactionResponse,
    PaginatedTransactionResponse
)
from app.services import transaction_service

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("", response_model=PaginatedTransactionResponse)
async def read_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    account_id: Optional[UUID] = Query(None),
    category_id: Optional[UUID] = Query(None),
    type: Optional[str] = Query(None, pattern="^(income|expense)$"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    tx_status: Optional[str] = Query(None, alias="status", pattern="^(completed|pending)$"),
    sort_by: str = Query("date", pattern="^(date|amount|created_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await transaction_service.get_transactions(
        db=db,
        user_id=user_id,
        page=page,
        limit=limit,
        account_id=account_id,
        category_id=category_id,
        type=type,
        start_date=start_date,
        end_date=end_date,
        search=search,
        tags=tags,
        tx_status=tx_status,
        sort_by=sort_by,
        sort_order=sort_order
    )

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    tx_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await transaction_service.create_transaction(db, user_id, tx_in)

@router.get("/{tx_id}", response_model=TransactionResponse)
async def read_transaction(
    tx_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await transaction_service.get_transaction(db, user_id, tx_id)

@router.patch("/{tx_id}", response_model=TransactionResponse)
async def update_transaction(
    tx_id: UUID,
    tx_in: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await transaction_service.update_transaction(db, user_id, tx_id, tx_in)

@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    tx_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    await transaction_service.delete_transaction(db, user_id, tx_id)

@router.post("/{tx_id}/restore", response_model=TransactionResponse)
async def restore_transaction(
    tx_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await transaction_service.restore_transaction(db, user_id, tx_id)
