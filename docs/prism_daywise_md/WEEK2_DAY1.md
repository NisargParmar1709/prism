# WEEK2_CHECKLIST_v2.md
## Prism — Week 2: Transactions, Categories, Tags & Recurring Rules

> **Duration:** 5 days (Days 1–5)
> **Goal:** User can add, edit, delete transactions with categories and tags. Recurring rules generate transactions automatically.
> **Exit Gate:** You can add 10 transactions across 3 accounts, categorize them, tag them, and see recurring transactions generate automatically.

---

## Pre-Reading
Read in order:
1. `PROJECT_CONTEXT_v2.md`
2. `AUTH_GUIDE.md`
3. `ENV_REFERENCE.md`
4. `FINANCIAL_SAFETY_RULES.md`
5. `API_CONTRACT_v2.md` (Sections 5, 6, 12)
6. `PAGES_SPEC.md` (Pages 02 — Transactions)

---

## Day 1: CRITICAL FIXES (Task 0) + Categories Backend

### Task 0.1: Fix Transaction Schema (CRITICAL — Audit Bug #3)

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /FINANCIAL_SAFETY_RULES.md Rule 1 and Rule 3.

## TASK
Fix the transaction model to use exact decimal math and soft delete.

Current broken code (apps/api/app/models/transaction.py):
```python
amount: Float  # WRONG
created_at: TIMESTAMP  # WRONG — no timezone
# No deleted_at field — hard delete only
Fix to:
Python
from decimal import Decimal
from sqlalchemy import Numeric, TIMESTAMPTZ
from datetime import datetime, timezone

class Transaction(Base):
    __tablename__ = "transactions"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(index=True)
    account_id: Mapped[UUID] = mapped_column(ForeignKey("accounts.id"))
    category_id: Mapped[UUID] = mapped_column(ForeignKey("categories.id"))
    type: Mapped[str] = mapped_column(String(10))  # "income" or "expense"
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    status: Mapped[str] = mapped_column(String(20), default="completed")
    payment_method: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMPTZ, nullable=True)  # Soft delete
    
    # Relationships
    account: Mapped["Account"] = relationship("Account", back_populates="transactions")
    category: Mapped["Category"] = relationship("Category", back_populates="transactions")
Also create Alembic migration to:
Alter amount column from FLOAT to NUMERIC(12,2)
Add deleted_at TIMESTAMPTZ column
Convert existing timestamps to UTC
CONSTRAINTS
Use Numeric(12,2), never Float
Use TIMESTAMPTZ, never TIMESTAMP
deleted_at = None means active, not None means soft-deleted
Add index on (user_id, date) for fast filtering
Add index on (user_id, deleted_at) to exclude soft-deleted by default
VERIFICATION
Migration runs successfully
New transaction with amount 0.1 + 0.2 stores exactly 0.30 (not 0.30000000000000004)
Soft-deleted transaction still exists in DB but excluded from queries
RLS policy: user_id = auth.uid()
plain

---

### Task 0.2: Remove Stored Balance Column (CRITICAL — Audit Bug #1)

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /FINANCIAL_SAFETY_RULES.md Rule 2.

## TASK
Remove the `balance` column from accounts table and create a computed balance function.

1. Create Alembic migration to drop `balance` column from `accounts` table
2. Create computed balance function in account service:

```python
from decimal import Decimal
from sqlalchemy import select, func

async def compute_account_balance(db, account_id: UUID, user_id: UUID) -> Decimal:
    """Compute balance from opening_balance + sum of non-deleted transactions."""
    # Verify account belongs to user
    account = await db.execute(
        select(Account).where(Account.id == account_id, Account.user_id == user_id)
    )
    account = account.scalar_one_or_none()
    if not account:
        raise HTTPException(404, "Account not found")
    
    # Sum all non-deleted transactions
    result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
        .where(
            Transaction.account_id == account_id,
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None)
        )
    )
    transactions_sum = result.scalar()
    
    return account.opening_balance + transactions_sum
Update AccountResponse schema to include current_balance as computed field (not stored)
Update all account endpoints to use computed balance
CONSTRAINTS
NO balance column in accounts table after migration
Balance computed on every fetch (acceptable for v1 scale)
For v1.1: Add Redis caching of balance with 60s TTL
Include soft-deleted filter in transaction sum
VERIFICATION
accounts table has no balance column
GET /accounts returns correct current_balance for each account
Adding a transaction updates the computed balance
Soft-deleting a transaction updates the computed balance
plain

---

### Task 1.1: Categories Backend

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /API_CONTRACT_v2.md Section 6 (Categories).

## TASK
Build the complete Categories backend.

Create:
1. `apps/api/app/models/category.py`:
```python
class Category(Base):
    __tablename__ = "categories"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID | None] = mapped_column(index=True, nullable=True)  # NULL = system default
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    icon: Mapped[str] = mapped_column(String(10), default="📦")  # Emoji or icon name
    color: Mapped[str] = mapped_column(String(7), default="#8B5CF6")  # Hex color
    type: Mapped[str] = mapped_column(String(10), default="expense")  # "income" or "expense"
    is_default: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="category")
Default categories (seed data):
Food & Dining 🍔 #F87171
Transport 🚌 #60A5FA
Shopping 🛍️ #A78BFA
Entertainment 🎬 #F472B6
Utilities ⚡ #FBBF24
Education 📚 #34D399
Health 🏥 #EF4444
Income 💰 #10B981
apps/api/app/routers/categories.py:
GET /categories → list all (system defaults + user's custom)
POST /categories → create custom category
PATCH /categories/{id} → update custom category (not defaults)
DELETE /categories/{id} → soft delete custom category
RLS policy: Users see system defaults (user_id IS NULL) OR their own (user_id = auth.uid())
CONSTRAINTS
System defaults have user_id = NULL
Users cannot modify/delete system defaults
Name must be 1-50 chars
Color must be valid hex
Icon is emoji or Lucide icon name
VERIFICATION
GET /categories returns 8 system defaults for new user
User can create custom category
User cannot delete system default
RLS: User A doesn't see User B's custom categories
plain

---

