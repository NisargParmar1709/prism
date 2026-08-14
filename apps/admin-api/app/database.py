from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

db_url = settings.admin_database_url.replace("postgresql://", "postgresql+asyncpg://") if settings.admin_database_url.startswith("postgresql://") else settings.admin_database_url
db_url = db_url.replace("sslmode=", "ssl=")

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_recycle=1800,
    pool_size=10,
    max_overflow=20
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
