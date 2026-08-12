from pydantic import BaseModel, Field, constr
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from enum import Enum

class AccountType(str, Enum):
    cash = "cash"
    bank = "bank"
    wallet = "wallet"
    fd = "fd"
    savings = "savings"
    emergency = "emergency"

class AccountBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    last_4_digits: Optional[constr(max_length=4)] = None
    opening_balance: Decimal = Field(default=Decimal('0.00'), ge=0, decimal_places=2, max_digits=12)
    currency: str = Field(default="INR", max_length=3)
    is_emergency_fund: bool = False
    emergency_target: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2, max_digits=12)

class AccountCreate(AccountBase):
    type: AccountType

class AccountUpdate(BaseModel):
    name: Optional[constr(min_length=1, max_length=50)] = None
    last_4_digits: Optional[constr(max_length=4)] = None
    opening_balance: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2, max_digits=12)
    is_emergency_fund: Optional[bool] = None
    emergency_target: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2, max_digits=12)

class AccountResponse(AccountBase):
    id: UUID
    user_id: UUID
    type: AccountType
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    current_balance: Decimal = Field(..., decimal_places=2, max_digits=12)

    class Config:
        from_attributes = True
