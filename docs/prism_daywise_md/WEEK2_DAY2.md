## Day 2: Transaction CRUD Backend

### Task 2.1: Transaction Service & Router

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /API_CONTRACT_v2.md Section 5 (Transactions) and /FINANCIAL_SAFETY_RULES.md Rules 1, 2, 3, 5.

## TASK
Build complete Transaction CRUD with computed balance updates.

Create:
1. `apps/api/app/schemas/transaction.py`:
```python
from decimal import Decimal
from pydantic import BaseModel, Field, validator
from datetime import date

class TransactionCreate(BaseModel):
    account_id: UUID
    category_id: UUID
    type: str = Field(..., regex="^(income|expense)$")
    amount: Decimal = Field(..., gt=0, decimal_places=2, max_digits=12)
    date: date
    note: str | None = Field(None, max_length=500)
    tags: list[str] = Field(default_factory=list)
    status: str = Field(default="completed", regex="^(completed|pending)$")
    payment_method: str | None = Field(None, max_length=20)
    
    @validator('amount')
    def amount_must_be_reasonable(cls, v):
        if v > Decimal('99999999.99'):
            raise ValueError('Amount exceeds maximum allowed')
        return v

class TransactionUpdate(BaseModel):
    category_id: UUID | None = None
    amount: Decimal | None = Field(None, gt=0, decimal_places=2, max_digits=12)
    date: date | None = None
    note: str | None = Field(None, max_length=500)
    tags: list[str] | None = None
    status: str | None = Field(None, regex="^(completed|pending)$")
    # CANNOT change: account_id, type (income/expense)
apps/api/app/services/transaction_service.py:
create_transaction(user_id, data) → validate account belongs to user, create tx, return with computed balance
get_transactions(user_id, filters) → paginated, filterable, exclude soft-deleted
get_transaction(user_id, tx_id) → single with account/category details
update_transaction(user_id, tx_id, data) → validate, update, return
delete_transaction(user_id, tx_id) → SOFT DELETE (set deleted_at)
get_transaction_summary(user_id, period) → income total, expense total, net
apps/api/app/routers/transactions.py:
GET /transactions (with all query params from API contract)
POST /transactions
GET /transactions/{id}
PATCH /transactions/{id}
DELETE /transactions/{id} (soft delete)
CONSTRAINTS
Amount > 0 always (type determines direction, not sign)
Income adds to balance, expense subtracts
Soft delete only — never hard delete
Update cannot change account_id or type
Validate account belongs to user before creating transaction
Tags stored as PostgreSQL array (not separate table for v1)
VERIFICATION
Create income transaction → balance increases
Create expense transaction → balance decreases
Update amount → balance recalculates
Soft delete → balance recalculates, transaction hidden from list
Try to change type → validation error
Try to access another user's transaction → 403
plain

---

