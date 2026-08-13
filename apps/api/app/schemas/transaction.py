from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
import datetime as dt
from datetime import datetime
from decimal import Decimal

class TransactionCreate(BaseModel):
    account_id: UUID
    category_id: UUID
    type: str = Field(..., pattern="^(income|expense)$")
    amount: Decimal = Field(..., gt=0, decimal_places=2, max_digits=12)
    date: dt.date
    note: Optional[str] = Field(None, max_length=500)
    tags: List[str] = Field(default_factory=list)
    status: str = Field(default="completed", pattern="^(completed|pending)$")
    payment_method: Optional[str] = Field(None, max_length=20)
    
    @field_validator('amount')
    @classmethod
    def amount_must_be_reasonable(cls, v):
        if v > Decimal('99999999.99'):
            raise ValueError('Amount exceeds maximum allowed')
        return v

    @field_validator('date')
    @classmethod
    def date_cannot_be_in_future(cls, v):
        if v > dt.date.today():
            raise ValueError('Transaction date cannot be in the future')
        return v

class TransactionUpdate(BaseModel):
    category_id: Optional[UUID] = None
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2, max_digits=12)
    date: Optional[dt.date] = None
    note: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = None
    status: Optional[str] = Field(None, pattern="^(completed|pending)$")
    payment_method: Optional[str] = Field(None, max_length=20)
    
    @field_validator('amount')
    @classmethod
    def amount_must_be_reasonable(cls, v):
        if v is not None and v > Decimal('99999999.99'):
            raise ValueError('Amount exceeds maximum allowed')
        return v

    @field_validator('date')
    @classmethod
    def date_cannot_be_in_future(cls, v):
        if v is not None and v > dt.date.today():
            raise ValueError('Transaction date cannot be in the future')
        return v

class TransactionResponse(BaseModel):
    id: UUID
    account_id: UUID
    account_name: str
    account_type: str
    category_id: UUID
    category_name: str
    category_icon: Optional[str]
    type: str
    amount: Decimal
    date: dt.date
    note: Optional[str]
    tags: List[str]
    status: str
    payment_method: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool

class PaginatedTransactionResponse(BaseModel):
    data: List[TransactionResponse]
    meta: PaginationMeta

class TransactionSummaryResponse(BaseModel):
    income_total: Decimal
    expense_total: Decimal
    net: Decimal
