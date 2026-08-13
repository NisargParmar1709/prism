import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Enum, Index
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base
import enum

class AccountType(str, enum.Enum):
    cash = "cash"
    bank = "bank"
    wallet = "wallet"
    fd = "fd"
    savings = "savings"
    emergency = "emergency"

class Account(Base):
    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(50), nullable=False)
    type = Column(Enum(AccountType), nullable=False)
    last_4_digits = Column(String(4), nullable=True)
    opening_balance = Column(Numeric(12, 2), default=0, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    is_emergency_fund = Column(Boolean, default=False, nullable=False)
    emergency_target = Column(Numeric(12, 2), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_accounts_user_id_is_archived", "user_id", "is_archived"),
    )

    transactions = relationship("Transaction", back_populates="account")
