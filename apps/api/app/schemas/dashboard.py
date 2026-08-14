from pydantic import BaseModel
from typing import List, Any
from datetime import datetime

class DashboardStats(BaseModel):
    total_balance: str
    income_this_month: str
    spent_this_month: str
    savings_rate: float

class CategoryDistributionItem(BaseModel):
    category_id: str
    category_name: str
    category_icon: str
    amount: str
    percentage: float

class DashboardResponse(BaseModel):
    greeting: str
    date: datetime
    period: str
    stats: DashboardStats
    accounts: List[Any]  # Use Any to bypass strict typing for now or use Account schemas if needed
    budget_health: dict
    recent_transactions: dict
    category_distribution: List[CategoryDistributionItem]
    savings_goals: List[dict]
