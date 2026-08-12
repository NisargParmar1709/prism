from typing import AsyncGenerator, Annotated
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
import redis.asyncio as redis
from jose import jwt, JWTError
from .config import settings

# 1. Database
# Using asyncpg via postgresql+asyncpg://
db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://") if settings.DATABASE_URL.startswith("postgresql://") else settings.DATABASE_URL
engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

# 2. Redis
async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        yield client
    finally:
        await client.aclose()

# 3. User Authentication
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()

async def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.INSFORGE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "AUTHENTICATION_ERROR", "message": "Token missing user identifier"}
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTHENTICATION_ERROR", "message": "Invalid or expired token"}
        )

# 4. Admin Authentication
async def get_admin_user(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.ADMIN_SECRET_KEY,
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTHENTICATION_ERROR", "message": "Invalid or expired admin token"}
        )
