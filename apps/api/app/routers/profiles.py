from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.dependencies import get_db, get_current_user
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/users/me", tags=["profile"])

@router.get("", response_model=ProfileResponse)
async def get_my_profile(
    user_id: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await ProfileService.get_profile(db, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Profile not found"}
        )
    return profile

@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_my_profile(
    data: ProfileCreate,
    user_id: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await ProfileService.get_profile(db, user_id)
    if profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "CONFLICT", "message": "Profile already exists"}
        )
    return await ProfileService.create_profile(db, user_id, data)

@router.patch("", response_model=ProfileResponse)
async def update_my_profile(
    data: ProfileUpdate,
    user_id: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await ProfileService.get_profile(db, user_id)
    if not profile:
        from app.schemas.profile import ProfileCreate
        create_data = ProfileCreate(
            full_name=data.full_name,
            college=data.college,
            avatar_url=data.avatar_url,
            currency=data.currency or "INR"
        )
        profile = await ProfileService.create_profile(db, user_id, create_data)
        
    return await ProfileService.update_profile(db, profile, data)

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    user_id: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Retrieve the profile
    profile = await ProfileService.get_profile(db, user_id)
    if profile:
        # In a complete application, you would also need to delete or archive all associated
        # records (accounts, transactions, etc.) depending on cascade rules.
        # Alternatively, Supabase Auth handles the user deletion, and a webhook might clean up the DB.
        # We'll just delete the profile for now to satisfy the frontend requirement.
        await db.delete(profile)
        await db.commit()
    return None
