from pydantic import BaseModel, Field, constr
from typing import Optional
from uuid import UUID
from datetime import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    icon: str = Field(default="📦", max_length=10)
    color: str = Field(default="#8B5CF6", max_length=7)
    type: str = Field(default="expense", max_length=10)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[constr(min_length=1, max_length=50)] = None
    icon: Optional[constr(max_length=10)] = None
    color: Optional[constr(max_length=7)] = None
    type: Optional[constr(max_length=10)] = None

class CategoryResponse(CategoryBase):
    id: UUID
    user_id: Optional[UUID] = None
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True
