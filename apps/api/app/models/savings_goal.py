import uuid
from decimal import Decimal
from datetime import date
from sqlalchemy import String, Numeric, Date, text, event
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from .base import Base

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    icon: Mapped[str | None] = mapped_column(String, nullable=True)
    target_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    current_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    monthly_contribution: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)

# Add RLS Policy
def create_savings_goals_rls(target, connection, **kw):
    connection.execute(text('ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;'))
    connection.execute(text('''
        CREATE POLICY "Users can only access their own savings goals" 
        ON savings_goals 
        FOR ALL 
        USING (user_id = auth.uid());
    '''))

event.listen(SavingsGoal.__table__, 'after_create', create_savings_goals_rls)
