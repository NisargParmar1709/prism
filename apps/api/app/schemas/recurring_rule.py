from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from decimal import Decimal

class RecurringRuleBase(BaseModel):
    account_id: UUID
    category_id: UUID
    type: str = Field(..., pattern="^(income|expense)$")
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    frequency: str = Field(..., pattern="^(daily|weekly|biweekly|monthly|quarterly|yearly)$")
    start_date: date
    end_date: Optional[date] = None
    note: Optional[str] = None
    is_active: bool = True

class RecurringRuleCreate(RecurringRuleBase):
    pass

class RecurringRuleUpdate(BaseModel):
    account_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    frequency: Optional[str] = Field(None, pattern="^(daily|weekly|biweekly|monthly|quarterly|yearly)$")
    end_date: Optional[date] = None
    note: Optional[str] = None
    is_active: Optional[bool] = None

class RecurringRuleResponse(RecurringRuleBase):
    id: UUID
    user_id: UUID
    next_run: date
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
