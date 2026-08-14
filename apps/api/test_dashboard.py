import asyncio
import os
from decimal import Decimal
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from dotenv import load_dotenv

from app.models.profile import Profile
from app.services.dashboard_service import get_dashboard_data

load_dotenv(os.path.join(os.path.dirname(__file__), ".env.local"))
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

if "?sslmode=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)

async def run_test():
    async with AsyncSessionLocal() as db:
        # Get a user
        result = await db.execute(select(Profile).limit(1))
        user = result.scalar_one_or_none()
        if not user:
            print("No user found.")
            return

        user_id = user.user_id
        period = datetime.now(timezone.utc).strftime("%Y-%m")
        
        data = await get_dashboard_data(db, user_id, period)
        
        print("Dashboard Data:")
        print(f"Greeting: {data['greeting']}")
        print(f"Date: {data['date']}")
        print(f"Period: {data['period']}")
        print(f"Stats: {data['stats']}")
        print(f"Accounts: {len(data['accounts'])}")
        print(f"Budgets: {len(data['budget_health'].get('data', []))}")
        print(f"Recent Transactions: {len(data['recent_transactions'].get('data', []))}")
        print(f"Category Distribution: {len(data['category_distribution'])}")
        print(f"Savings Goals: {len(data['savings_goals'])}")
        
        # Validation checks
        assert isinstance(data['stats']['total_balance'], str)
        assert isinstance(data['stats']['income_this_month'], str)
        assert isinstance(data['stats']['spent_this_month'], str)
        print("Validation successful!")

if __name__ == "__main__":
    asyncio.run(run_test())
