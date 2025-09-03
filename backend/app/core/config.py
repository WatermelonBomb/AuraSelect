import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # プロジェクト基本設定
    PROJECT_NAME: str = "AuraSelect"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "美容室物販促進アプリケーション"
    
    # API設定
    API_V1_STR: str = "/api/v1"
    
    # CORS設定
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",  # Next.js development
        "http://localhost:3001",  # Next.js alternative
        "http://localhost:3002",  # Next.js alternative
        "http://localhost:3003",  # Next.js alternative
        "http://localhost:3004",  # Next.js alternative
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002", 
        "http://127.0.0.1:3003",
        "http://127.0.0.1:3004",
        "https://localhost:3000",
        "https://*.vercel.app",   # Vercel deployment
    ]
    
    # データベース設定
    POSTGRES_USER: str = "auraselect"
    POSTGRES_PASSWORD: str = "password123"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "auraselect_db"
    
    @property
    def DATABASE_URL(self) -> str:
        return "sqlite:///./auraselect.db"
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        return "sqlite+aiosqlite:///./auraselect.db"
    
    # Redis設定 (キャッシュ・セッション用)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    
    @property
    def REDIS_URL(self) -> str:
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # JWT設定
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # セキュリティ設定
    BCRYPT_ROUNDS: int = 12
    
    # 環境設定
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # ログ設定
    LOG_LEVEL: str = "INFO"
    
    # ファイルアップロード設定
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# グローバル設定インスタンス
settings = Settings()