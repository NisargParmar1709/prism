from typing import AsyncGenerator, Annotated
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
import redis.asyncio as redis
from jose import jwt, JWTError
from .config import settings

# 1. Database
# Using asyncpg via postgresql+asyncpg://
db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://") if settings.DATABASE_URL.startswith("postgresql://") else settings.DATABASE_URL
# asyncpg expects 'ssl' instead of 'sslmode' in the query string
db_url = db_url.replace("sslmode=", "ssl=")
engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

# 2. Redis
from typing import Optional

async def get_redis() -> AsyncGenerator[Optional[redis.Redis], None]:
    if not settings.ENABLE_CACHING:
        yield None
        return
        
    redis_url = settings.REDIS_URL
    if "upstash.io" in redis_url and redis_url.startswith("redis://"):
        redis_url = redis_url.replace("redis://", "rediss://")
    
    try:
        client = redis.from_url(redis_url, decode_responses=True)
        yield client
    except Exception as e:
        print(f"Redis initialization error: {e}")
        yield None
    finally:
        if 'client' in locals() and client is not None:
            await client.aclose()

# 3. User Authentication
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()

import httpx
from redis import exceptions as redis_exceptions

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    redis_client: Annotated[Optional[redis.Redis], Depends(get_redis)]
):
    token = credentials.credentials
    cache_key = f"auth_token:{token}"
    
    # Check cache first
    if settings.ENABLE_CACHING and redis_client is not None:
        try:
            cached_user_id = await redis_client.get(cache_key)
            if cached_user_id:
                from uuid import UUID
                return UUID(cached_user_id)
        except redis_exceptions.RedisError as e:
            print(f"Redis Cache Error: {e}")
            # Ignore cache errors and fall back to remote verification

    # Verify JWT token using InsForge JWT Secret
    try:
        unverified_header = jwt.get_unverified_header(token)
        print(f"DEBUG JWT HEADER: {unverified_header}")
        
        payload = jwt.decode(
            token,
            settings.INSFORGE_JWT_SECRET,
            algorithms=["HS256", "RS256"],
            audience="authenticated"
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "AUTHENTICATION_ERROR", "message": "Token missing user identifier"}
            )
        from uuid import UUID
        user_uuid = UUID(user_id)
        
        # Optionally cache it if caching is enabled
        if settings.ENABLE_CACHING and redis_client is not None:
            try:
                await redis_client.set(cache_key, str(user_uuid), ex=300)
            except redis_exceptions.RedisError as e:
                print(f"Redis Cache Write Error: {e}")
                
        return user_uuid
    except JWTError as e:
        print(f"JWT Decode Error: {e}")
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
