import uuid
from decimal import Decimal
from datetime import date, datetime
from pydantic import BaseModel, Field

class SavingsGoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    icon: str | None = None
    target_amount: Decimal = Field(..., gt=0, decimal_places=2, max_digits=12)
    monthly_contribution: Decimal = Field(default=Decimal('0.00'), ge=0, decimal_places=2, max_digits=12)
    deadline: date | None = None

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    icon: str | None = None
    target_amount: Decimal | None = Field(None, gt=0, decimal_places=2, max_digits=12)
    monthly_contribution: Decimal | None = Field(None, ge=0, decimal_places=2, max_digits=12)
    deadline: date | None = None

class SavingsGoalContribute(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2, max_digits=12)

class SavingsGoalResponse(SavingsGoalBase):
    id: uuid.UUID
    user_id: uuid.UUID
    current_amount: Decimal
    percentage: int
    remaining: Decimal
    status: str
    class Config:
        from_attributes = True
