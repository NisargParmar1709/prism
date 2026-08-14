from fastapi import APIRouter
from .profiles import router as profiles_router
from .accounts import router as accounts_router
from .savings_goals import router as savings_goals_router
from .settings import router as settings_router
from .transactions import router as transactions_router
from .export import router as export_router
from .categories import router as categories_router
from .recurring_rules import router as recurring_rules_router
from .budgets import router as budgets_router
from .notifications import router as notifications_router
from .dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(profiles_router)
api_router.include_router(accounts_router)
api_router.include_router(savings_goals_router)
api_router.include_router(settings_router)
api_router.include_router(export_router)
api_router.include_router(categories_router)
api_router.include_router(transactions_router)
api_router.include_router(recurring_rules_router)
api_router.include_router(budgets_router)
api_router.include_router(notifications_router)
api_router.include_router(dashboard_router)
