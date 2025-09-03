from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# SQLite用の非同期エンジンを作成
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./auraselect.db"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables():
    """データベースとテーブルを作成"""
    from app.models.base import Base
    # すべてのモデルをインポートしてMetadataに登録
    from app.models.user import User
    from app.models.product import Product
    from app.models.trial_request import TrialRequest
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """非同期セッションを取得"""
    async with async_session_maker() as session:
        yield session