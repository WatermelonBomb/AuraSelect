# API v1 endpoints
from fastapi import APIRouter
from .products import router as products_router
from .trial_requests import router as trial_requests_router
from .users import router as users_router

api_router = APIRouter()

# 各APIルーターを登録
api_router.include_router(products_router, prefix="/products", tags=["products"])
api_router.include_router(trial_requests_router, prefix="/trial-requests", tags=["trial-requests"])
api_router.include_router(users_router, prefix="/users", tags=["users"])