Day 4: Recurring Rules Backend
Task 4.1: Recurring Rules Engine
AntiGravity Prompt:
markdown
## CONTEXT
Read /API_CONTRACT_v2.md Section 12 (Recurring Rules) and /FINANCIAL_SAFETY_RULES.md Rule 5 (Idempotency).

## TASK
Build the recurring transaction engine.

Create:
1. `apps/api/app/models/recurring_rule.py`:
```python
class RecurringRule(Base):
    __tablename__ = "recurring_rules"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(index=True)
    account_id: Mapped[UUID] = mapped_column(ForeignKey("accounts.id"))
    category_id: Mapped[UUID] = mapped_column(ForeignKey("categories.id"))
    type: Mapped[str] = mapped_column(String(10))  # income/expense
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    frequency: Mapped[str] = mapped_column(String(20))  # daily, weekly, biweekly, monthly, quarterly, yearly
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_run: Mapped[date] = mapped_column(Date)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=lambda: datetime.now(timezone.utc))
apps/api/app/services/recurring_service.py:
create_rule(user_id, data) → validate, create rule
generate_due_transactions() → called by cron job
Idempotency: INSERT ... ON CONFLICT (recurring_rule_id, scheduled_date) DO NOTHING
calculate_next_run(rule) → based on frequency
apps/api/app/routers/recurring_rules.py:
GET /recurring-rules
POST /recurring-rules
GET /recurring-rules/{id}
PATCH /recurring-rules/{id}
DELETE /recurring-rules/{id} (soft delete)
GET /recurring-rules/upcoming → next 5 due payments
InsForge Edge Function cron job (Deno/TypeScript):
Runs every day at 6 AM IST
Calls internal API to generate due transactions
Logs execution
CONSTRAINTS
Idempotency key: (recurring_rule_id, scheduled_date) UNIQUE
Frequency: daily, weekly, biweekly, monthly, quarterly, yearly
next_run auto-updates after generation
End date stops generation
Soft delete stops generation
All amounts NUMERIC(12,2)
VERIFICATION
Create monthly rule → next_run set correctly
Cron runs → transaction generated → next_run advances
Run cron again → no duplicate (idempotency)
Set end_date → generation stops
Upcoming endpoint shows correct next 5
plain

---

