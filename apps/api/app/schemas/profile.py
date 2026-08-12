from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    college: Optional[str] = None
    avatar_url: Optional[str] = None
    currency: Optional[str] = "INR"

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    onboarding_completed: Optional[bool] = None

class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    onboarding_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
