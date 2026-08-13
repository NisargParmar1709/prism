## Day 2: Budget Alerts & Notifications Backend

### Task 2.1: Notification System

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /API_CONTRACT_v2.md Section 13 (Notifications).

## TASK
Build the in-app notification system.

Create:
1. `apps/api/app/models/notification.py`:
```python
class Notification(Base):
    __tablename__ = "notifications"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(index=True)
    type: Mapped[str] = mapped_column(String(50))  # budget_alert, budget_exceeded, etc.
    title: Mapped[str] = mapped_column(String(100))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(default=False)
    action_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=lambda: datetime.now(timezone.utc))
apps/api/app/services/notification_service.py:
create_notification(user_id, type, title, message, action_url)
get_notifications(user_id, unread_only=False)
mark_read(user_id, notification_id)
mark_all_read(user_id)
check_budget_alerts(user_id, period) → creates notifications at 80% and 100%
Alert triggers (called after every transaction creation):
Python
async def check_budget_alerts(db, user_id, category_id, period):
    budget = await get_budget_for_category(db, user_id, category_id, period)
    if not budget:
        return
    
    spent = await get_budget_spent(db, user_id, category_id, period)
    percentage = (spent / budget.amount) * 100
    
    if percentage >= 100:
        await create_notification(
            user_id, "budget_exceeded",
            f"Budget Exceeded: {budget.category.name}",
            f"You've exceeded your {budget.category.name} budget of ₹{budget.amount}",
            "/budgets"
        )
    elif percentage >= 80:
        await create_notification(
            user_id, "budget_warning",
            f"Budget Warning: {budget.category.name}",
            f"You've used {percentage:.0f}% of your {budget.category.name} budget",
            "/budgets"
        )
apps/api/app/routers/notifications.py:
GET /notifications?unread_only=false
PATCH /notifications/{id}/read
PATCH /notifications/read-all
GET /notifications/unread-count
CONSTRAINTS
Alerts created automatically on transaction creation
No duplicate alerts for same threshold (track last_alert_percentage)
Unread count returned with list
RLS: user_id = auth.uid()
VERIFICATION
Create budget ₹1000 for Food
Add ₹800 expense → notification created: "Budget Warning"
Add ₹250 more → notification created: "Budget Exceeded"
No duplicate warning notification
GET /notifications shows both
Mark as read → unread count decreases
plain

---

