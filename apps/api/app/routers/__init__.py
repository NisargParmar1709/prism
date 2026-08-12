from fastapi import APIRouter
from .profiles import router as profiles_router

api_router = APIRouter()

api_router.include_router(profiles_router)
