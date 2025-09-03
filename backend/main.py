from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1 import api_router
from app.auth.config import fastapi_users, auth_backend
from app.db.database import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時
    await create_db_and_tables()
    yield
    # 終了時


app = FastAPI(
    lifespan=lifespan,
    title="AuraSelect API",
    description="美容室物販促進アプリケーションのバックエンドAPI",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# 認証ルーター
app.include_router(
    fastapi_users.get_auth_router(auth_backend), 
    prefix=settings.API_V1_STR + "/auth/jwt", 
    tags=["auth"]
)

# 登録ルーター
from app.schemas.user import UserCreate, UserRead, UserUpdate
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix=settings.API_V1_STR + "/auth",
    tags=["auth"]
)

# ユーザー管理ルーター
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix=settings.API_V1_STR + "/auth/users",
    tags=["users"]
)

# APIルーターを登録
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    """ヘルスチェック用エンドポイント"""
    return {
        "message": "AuraSelect API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/api/v1/health")
async def health_check():
    """詳細ヘルスチェック"""
    return {
        "status": "healthy",
        "service": "aura-select-api",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"]
    )