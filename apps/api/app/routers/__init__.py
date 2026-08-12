from fastapi import APIRouter
from .profiles import router as profiles_router
from .accounts import router as accounts_router
from .savings_goals import router as savings_goals_router
from .settings import router as settings_router
from .export import router as export_router

api_router = APIRouter()

api_router.include_router(profiles_router)
api_router.include_router(accounts_router)
api_router.include_router(savings_goals_router)
api_router.include_router(settings_router)
api_router.include_router(export_router)
