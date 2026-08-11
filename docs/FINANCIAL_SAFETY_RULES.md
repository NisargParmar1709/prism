# FINANCIAL_SAFETY_RULES.md
## Non-Negotiable Rules for Money-Handling Code

> **These rules override ANY AI suggestion. If the AI suggests something that violates these rules, reject it.**

---

## Rule 1: Money is Never a Float
```python
# ❌ WRONG — AI will try this
amount: float = 100.50  # 0.1 + 0.2 = 0.30000000000000004

# ✅ CORRECT
from decimal import Decimal
amount: Decimal = Decimal("100.50")  # Exact

# Database
amount NUMERIC(12, 2) NOT NULL  -- 12 digits total, 2 after decimal
```

**Why:** Floating-point arithmetic causes balance drift. A student checking their balance will see ₹10,000.0000000002 instead of ₹10,000.00. Over thousands of transactions, this compounds into real discrepancies.

**Enforcement:**
- Pydantic: `amount: Decimal = Field(decimal_places=2, max_digits=12)`
- SQLAlchemy: `Numeric(12, 2)`
- JavaScript: Use `currency.js` or `dinero.js` for client-side math. Never `parseFloat` for display.
- JSON serialization: Convert Decimal to string `"100.50"`, not number `100.5`.

---

## Rule 2: Balance is Computed, Never Stored
```python
# ❌ WRONG — AI will try this
class Account(Base):
    balance: Mapped[Decimal] = mapped_column(Numeric(12,2))  # NO!

# ✅ CORRECT
class Account(Base):
    opening_balance: Mapped[Decimal] = mapped_column(Numeric(12,2), default=0)
    # balance = SELECT SUM(amount) FROM transactions WHERE account_id = X
```

**Why:** Storing balance creates a second source of truth. If a transaction is edited or deleted, the stored balance becomes a lie. Race conditions between two simultaneous transactions corrupt it silently.

**Enforcement:**
- No `balance` column in `accounts` table.
- Balance computed via SQL `SUM()` at query time.
- Redis cache of balance has 60s TTL max. Staleness is acceptable for dashboard, NOT for transaction entry.

---

## Rule 3: Every Transaction is Immutable (with Audit Trail)
```python
# ❌ WRONG — AI will try this
# DELETE FROM transactions WHERE id = 123

# ✅ CORRECT — Soft delete with reversal
# On "delete": Create a reversal transaction with negative amount
# Original stays visible in history
# OR: Keep transaction, mark is_deleted=true, create audit entry
```

**Why:** Financial records must be auditable. A student (or you, debugging) must be able to trace every change to their balance.

**Enforcement:**
- `transactions` table has `created_at`, `updated_at`, `deleted_at` (nullable)
- Hard delete only allowed within 5 minutes of creation ("oops" window)
- After 5 minutes: deletion creates a reversal transaction, original stays

---

## Rule 4: Timezone is UTC Everywhere, IST Only at Display
```python
# ❌ WRONG — AI will try this
created_at = datetime.now()  # Server local time? User local time? Chaos.

# ✅ CORRECT
from datetime import datetime, timezone
created_at = datetime.now(timezone.utc)  # UTC always

# Display layer (React)
const istDate = new Date(utcDate).toLocaleString('en-IN', { 
  timeZone: 'Asia/Kolkata',
  dateStyle: 'medium'
});
```

**Why:** A transaction at 11:30 PM IST on August 31 must appear in August's budget, not September's. If stored in UTC, it's 6:00 PM UTC on August 31 — still August. If stored in naive time, server timezone decides the month.

**Enforcement:**
- DB: `TIMESTAMPTZ` (not `TIMESTAMP`)
- Python: `datetime.now(timezone.utc)`
- JavaScript: `new Date().toISOString()` for API, `toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})` for display
- Budget periods: Start/end stored as UTC, compared against UTC transaction dates

---

## Rule 5: Idempotency for All Side Effects
```python
# ❌ WRONG — AI will try this
# Edge Function cron runs, generates recurring transactions
# Function retries due to timeout, generates duplicates

# ✅ CORRECT
INSERT INTO transactions (recurring_rule_id, scheduled_date, ...)
VALUES (...)
ON CONFLICT (recurring_rule_id, scheduled_date) DO NOTHING;
```

**Why:** Cron jobs, webhooks, and retries all create duplicate operations. In finance, duplicates are catastrophic (double rent payment).

**Enforcement:**
- Recurring transactions: Unique constraint on `(recurring_rule_id, scheduled_date)`
- Email sends: Idempotency key in notification table
- Balance recalculation: Deterministic SQL, not incremental updates

---

## Rule 6: Admin Never Sees Raw Financial Data
```python
# ❌ WRONG — AI will try this
# Admin API: SELECT * FROM transactions WHERE user_id = X

# ✅ CORRECT
# Admin API: SELECT COUNT(*), DATE_TRUNC('month', created_at) 
#            FROM transactions 
#            GROUP BY DATE_TRUNC('month', created_at)
```

**Why:** Even as solo admin, this is a privacy and legal habit. The PRD explicitly requires this boundary (FR-9.2).

**Enforcement:**
- Admin DB sync job: SELECT only aggregate counts, never amounts
- Admin API: No endpoint returns `amount`, `balance`, or `budget_value`
- Admin user list: Returns `id`, `email`, `created_at`, `is_suspended` only
- Break-glass: Logged audit trail if raw data access is ever needed

---

## Rule 7: AI Answers are SQL-First, Never Data-Dumps
```python
# ❌ WRONG — AI will try this
# User asks: "How much did I spend on food last month?"
# Code dumps ALL transactions into LLM prompt

# ✅ CORRECT
# 1. Parse NL to structured query
# 2. Execute SQL: SELECT SUM(amount) FROM transactions 
#    WHERE user_id = X AND category = 'Food' 
#    AND date >= '2026-07-01' AND date < '2026-08-01'
# 3. Send ONLY the result (₹4,250.00) to LLM for natural language formatting
```

**Why:** Privacy (don't leak data to LLM provider) + correctness (LLM can't hallucinate a sum) + cost (token limits).

**Enforcement:**
- NLQ pipeline: `nlq_parser → sql_generator → db_executor → llm_formatter`
- LLM prompt includes ONLY the query result, never raw transaction rows
- Max 10 rows sent to LLM for "list" queries, with explicit "here are your top 10 transactions"

---

## Rule 8: Rate Limiting is Distributed (Redis), Never In-Memory
```python
# ❌ WRONG — AI will try this
request_counts = {}  # In-memory dict

# ✅ CORRECT (Upstash Redis)
import redis.asyncio as redis
r = redis.from_url(REDIS_URL)

async def rate_limit(key: str, max_requests: int, window: int):
    current = await r.incr(key)
    if current == 1:
        await r.expire(key, window)
    if current > max_requests:
        raise HTTPException(429, "Rate limit exceeded")
```

**Why:** Vercel serverless rotates instances. In-memory rate limits reset every request. A user can bypass by making requests faster than instance reuse.

**Enforcement:**
- Auth endpoints: 5 attempts per 15 minutes per IP + per user
- AI endpoints: 10 requests per hour per user (protects cost)
- General API: 100 requests per minute per user
- Admin endpoints: 30 requests per minute per admin

---

## Rule 9: Input Validation is Server-Side, Always
```python
# ❌ WRONG — AI will try this
# Client validates amount > 0, server trusts it

# ✅ CORRECT
from pydantic import BaseModel, Field, validator

class TransactionCreate(BaseModel):
    amount: Decimal = Field(gt=0, decimal_places=2, max_digits=12)
    category_id: UUID

    @validator('amount')
    def amount_must_be_reasonable(cls, v):
        if v > Decimal('99999999.99'):
            raise ValueError('Amount exceeds maximum allowed')
        return v
```

**Why:** Client-side validation is for UX, not security. A malicious user can bypass it in 10 seconds with curl.

**Enforcement:**
- Every endpoint has Pydantic model
- SQL injection prevention via SQLAlchemy ORM (never raw string interpolation)
- XSS prevention via React's auto-escaping + explicit sanitization for any HTML rendering

---

## Rule 10: Graceful Degradation for AI Features
```python
# ❌ WRONG — AI will try this
# Dashboard waits for LLM summary before rendering
# If LLM is down, white screen

# ✅ CORRECT
# Dashboard renders immediately with cached data
# AI summary loads asynchronously in a separate card
# If LLM fails: Show "AI insights unavailable" with a retry button
# Core features (add transaction, view balance) NEVER depend on AI
```

**Why:** The PRD requires this (NFR-5.5). A student must be able to track money even if the AI provider is down.

**Enforcement:**
- AI features wrapped in try/except with fallback
- AI timeout: 5 seconds max, then fallback
- Dashboard: No blocking AI calls
- NLQ: If AI fails, show raw SQL result in a simple table

---

## Rule 11: Backup is Tested, Not Assumed
```
❌ WRONG: "InsForge handles backups"
✅ CORRECT: 
  1. Export data via pg_dump monthly
  2. Restore to local Docker Postgres
  3. Verify balances match production
  4. Document exact restore commands
```

**Why:** A backup you've never restored is a hope, not a backup. Financial data demands certainty.

---

## Rule 12: No Secrets in Code, Ever
```python
# ❌ WRONG — AI will try this
API_KEY = "sk-live-abc123"  # In source code

# ✅ CORRECT
import os
API_KEY = os.getenv("AI_API_KEY")
# .env.local (gitignored) for dev
# InsForge secrets manager for prod
```

**Why:** One git push to public repo = compromised API keys, database access, AI credits drained.

**Enforcement:**
- `.env.example` with dummy values checked in
- `.env.local` in `.gitignore` from commit #1
- Pre-commit hook scanning for secrets (git-secrets or similar)
- InsForge secrets for all production values
