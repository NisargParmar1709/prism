from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import Optional

from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate

class ProfileService:
    @staticmethod
    async def get_profile(db: AsyncSession, user_id: UUID) -> Optional[Profile]:
        result = await db.execute(select(Profile).where(Profile.user_id == user_id))
        return result.scalars().first()

    @staticmethod
    async def create_profile(db: AsyncSession, user_id: UUID, data: ProfileCreate) -> Profile:
        profile = Profile(user_id=user_id, **data.model_dump(exclude_unset=True))
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def update_profile(db: AsyncSession, profile: Profile, data: ProfileUpdate) -> Profile:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)
        await db.commit()
        await db.refresh(profile)
        return profile
