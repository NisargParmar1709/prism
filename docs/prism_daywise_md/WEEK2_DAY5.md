## Day 5: Integration & Polish

### Task 5.1: Transaction Detail & Edit

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PAGES_SPEC.md Page 02 (Transaction detail interactions).

## TASK
Build transaction detail view and edit flow.

Create:
1. `apps/web/app/transactions/[id]/page.tsx`:
   - Transaction detail page
   - Amount (large, color-coded)
   - Category icon + name
   - Account name
   - Date and time
   - Note
   - Tags (pill chips)
   - Status
   - Payment method
   - [Edit] [Delete] buttons

2. `apps/web/components/transactions/TransactionEditModal.tsx`:
   - Pre-filled with current data
   - Cannot change: account, type
   - Can change: amount, category, date, note, tags, status
   - Validation: amount > 0

3. Delete confirmation:
   - "Delete this transaction?"
   - "This will remove ₹X from your [Account] balance"
   - [Delete] danger | [Cancel] ghost
   - Undo toast (5 seconds)

## CONSTRAINTS
- Reuse QuickAddModal layout where possible
- Optimistic update on edit
- Soft delete (transaction hidden, balance recalculated)
- Undo available for 5 seconds after delete
- Light mode only

## VERIFICATION
1. Click transaction → detail page
2. Edit → changes reflect immediately (optimistic)
3. Delete → confirmation → soft delete → balance updates
4. Undo → transaction restored
5. Cannot change account or type
Week 2 Exit Gate Checklist
[ ] Transaction schema uses NUMERIC(12,2), not FLOAT
[ ] Transaction schema has deleted_at for soft delete
[ ] Account balance is computed, not stored as column
[ ] Categories: 8 system defaults + user can create custom
[ ] Transaction CRUD: create, read, update, soft delete
[ ] QuickAddModal: < 10 seconds for default expense
[ ] Transactions page: grouped by date, searchable, filterable
[ ] Recurring rules: create, generate, idempotency
[ ] Upcoming payments endpoint works
[ ] Optimistic UI on all mutations
[ ] Mobile swipe actions work
[ ] RLS on all user tables
Week 2 Anti-Hallucination Checks
Table
#	AI Mistake	Your Correction
1	Uses Float for amount	Numeric(12,2)
2	Stores balance column	Computed only
3	Hard deletes transaction	Soft delete with deleted_at
4	No idempotency on recurring	ON CONFLICT DO NOTHING
5	Allows negative amounts	amount > 0 always
6	Changes transaction type	Immutable after creation
7	No optimistic UI	Must implement for all mutations
8	Missing RLS	All user tables need policies
plain

---

