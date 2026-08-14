from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from app.dependencies import get_db, get_current_user
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from app.services import account_service

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.get("", response_model=List[AccountResponse])
async def read_accounts(
    include_archived: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    accounts = await account_service.get_accounts(db, user_id, include_archived)
    return accounts

@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    account_in: AccountCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await account_service.create_account(db, user_id, account_in)

@router.get("/{account_id}", response_model=AccountResponse)
async def read_account(
    account_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await account_service.get_account(db, user_id, account_id)

@router.patch("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: UUID,
    account_in: AccountUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    return await account_service.update_account(db, user_id, account_id, account_in)

@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def archive_account(
    account_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    await account_service.archive_account(db, user_id, account_id)

@router.patch("/{account_id}/restore", status_code=status.HTTP_204_NO_CONTENT)
async def restore_account(
    account_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user)
):
    await account_service.unarchive_account(db, user_id, account_id)
