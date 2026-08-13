from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from fastapi import HTTPException, status
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

async def get_categories(db: AsyncSession, user_id: UUID):
    # Fetch system defaults (user_id IS NULL) and user's custom categories
    query = select(Category).where(
        or_(Category.user_id.is_(None), Category.user_id == user_id),
        Category.deleted_at.is_(None)
    )
    result = await db.execute(query)
    return result.scalars().all()

async def create_category(db: AsyncSession, user_id: UUID, category_in: CategoryCreate):
    db_category = Category(
        **category_in.model_dump(),
        user_id=user_id,
        is_default=False
    )
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

async def update_category(db: AsyncSession, user_id: UUID, category_id: UUID, category_in: CategoryUpdate):
    category = await db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        
    if category.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify system or other user's category")
        
    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
        
    await db.commit()
    await db.refresh(category)
    return category

async def delete_category(db: AsyncSession, user_id: UUID, category_id: UUID):
    category = await db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        
    if category.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete system or other user's category")
        
    from sqlalchemy.sql import func
    category.deleted_at = func.now()
    await db.commit()
