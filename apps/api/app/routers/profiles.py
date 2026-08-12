from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.dependencies import get_db, get_current_user
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/users/me", tags=["profile"])

@router.get("", response_model=ProfileResponse)
async def get_my_profile(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await ProfileService.get_profile(db, UUID(user_id))
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Profile not found"}
        )
    return profile

@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_my_profile(
    data: ProfileCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    uid = UUID(user_id)
    profile = await ProfileService.get_profile(db, uid)
    if profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "CONFLICT", "message": "Profile already exists"}
        )
    return await ProfileService.create_profile(db, uid, data)

@router.patch("", response_model=ProfileResponse)
async def update_my_profile(
    data: ProfileUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    uid = UUID(user_id)
    profile = await ProfileService.get_profile(db, uid)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Profile not found"}
        )
    return await ProfileService.update_profile(db, profile, data)
