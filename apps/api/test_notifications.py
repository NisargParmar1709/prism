import asyncio
import uuid
from decimal import Decimal
from datetime import datetime, timezone
import os

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, text
from app.models.budget import Budget
from app.models.notification import Notification
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.account import Account
from app.models.profile import Profile
from app.services.notification_service import check_budget_alerts
from app.services.transaction_service import create_transaction
from app.schemas.transaction import TransactionCreate

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env.local"))
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

if "?sslmode=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)

async def run_test():
    async with AsyncSessionLocal() as db:
        # Get a user and category
        result = await db.execute(select(Profile).limit(1))
        user = result.scalar_one_or_none()
        if not user:
            print("No user found.")
            return

        user_id = user.user_id
        
        result = await db.execute(select(Account).where(Account.user_id == user_id).limit(1))
        account = result.scalar_one_or_none()
        if not account:
            # Let's create an account
            account = Account(user_id=user_id, name="Test Account", type="bank", opening_balance=Decimal("5000"), currency="INR")
            db.add(account)
            await db.commit()
            await db.refresh(account)
        
        result = await db.execute(select(Category).where(Category.type == 'expense').limit(1))
        category = result.scalar_one_or_none()
        if not category:
            category = Category(name="Food", icon="🍔", type="expense", color="#F87171")
            db.add(category)
            await db.commit()
            await db.refresh(category)

        period = datetime.now(timezone.utc).strftime("%Y-%m")
        
        # Cleanup any existing budget/notifications for this test
        await db.execute(text("DELETE FROM notifications WHERE user_id = :uid"), {"uid": user_id})
        await db.execute(text("DELETE FROM transactions WHERE user_id = :uid AND category_id = :cid"), {"uid": user_id, "cid": category.id})
        await db.execute(text("DELETE FROM budgets WHERE user_id = :uid AND category_id = :cid AND period = :p"), {"uid": user_id, "cid": category.id, "p": period})
        await db.commit()

        # Create budget for ₹1000
        budget = Budget(user_id=user_id, category_id=category.id, amount=Decimal("1000"), period=period)
        db.add(budget)
        await db.commit()
        await db.refresh(budget)
        print(f"Created budget for {category.name}: Rs.{budget.amount}")

        # Add Rs.800 expense (80%)
        print("Adding Rs.800 expense...")
        tx1 = TransactionCreate(
            account_id=account.id,
            category_id=category.id,
            type="expense",
            amount=Decimal("800"),
            date=datetime.now(timezone.utc).date(),
            note="Test tx 1",
            status="completed",
            payment_method="UPI"
        )
        await create_transaction(db, user_id, tx1)
        
        # Check notifications
        notifs = await db.execute(select(Notification).where(Notification.user_id == user_id))
        notifs = notifs.scalars().all()
        print(f"Notifications after Rs.800: {[n.type for n in notifs]}")
        assert any(n.type == 'budget_warning' for n in notifs)

        # Add Rs.50 expense
        print("Adding Rs.50 expense...")
        tx2 = TransactionCreate(
            account_id=account.id,
            category_id=category.id,
            type="expense",
            amount=Decimal("50"),
            date=datetime.now(timezone.utc).date(),
            note="Test tx 2",
            status="completed",
            payment_method="UPI"
        )
        await create_transaction(db, user_id, tx2)
        
        # Check notifications (should not duplicate)
        notifs = await db.execute(select(Notification).where(Notification.user_id == user_id))
        notifs = notifs.scalars().all()
        print(f"Notifications after Rs.50: {[n.type for n in notifs]}")
        assert len([n for n in notifs if n.type == 'budget_warning']) == 1
        
        # Add Rs.250 expense (total 1100 -> >100%)
        print("Adding Rs.250 expense...")
        tx3 = TransactionCreate(
            account_id=account.id,
            category_id=category.id,
            type="expense",
            amount=Decimal("250"),
            date=datetime.now(timezone.utc).date(),
            note="Test tx 3",
            status="completed",
            payment_method="UPI"
        )
        await create_transaction(db, user_id, tx3)
        
        # Check notifications
        notifs = await db.execute(select(Notification).where(Notification.user_id == user_id))
        notifs = notifs.scalars().all()
        print(f"Notifications after Rs.250: {[n.type for n in notifs]}")
        assert any(n.type == 'budget_exceeded' for n in notifs)
        
        print("Test passed successfully!")

if __name__ == "__main__":
    asyncio.run(run_test())
