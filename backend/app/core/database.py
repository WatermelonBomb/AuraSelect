from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from .config import settings

# 非同期データベースエンジン作成
engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=settings.DEBUG,  # SQLログ出力（開発時のみ）
    poolclass=StaticPool if "sqlite" in settings.ASYNC_DATABASE_URL else None,
    connect_args={"check_same_thread": False} if "sqlite" in settings.ASYNC_DATABASE_URL else {}
)

# セッションメーカー
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    データベースセッションを取得する依存性注入関数
    FastAPIの依存性注入で使用
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables():
    """
    テーブルを作成する関数（開発・テスト用）
    本番環境ではAlembicマイグレーションを使用
    """
    from ..models import Base
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_tables():
    """
    全てのテーブルを削除する関数（テスト用）
    """
    from ..models import Base
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)