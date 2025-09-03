import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
import sys
import os

# パスの調整
sys.path.append(os.path.dirname(os.path.abspath(__file__)).replace('tests', ''))

from main import app
from app.core.database import get_db
from app.models import Base

# テスト用のインメモリSQLiteデータベース
SQLITE_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLITE_DATABASE_URL,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
    echo=False
)

TestingSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False
)


async def override_get_db():
    """テスト用データベースセッション"""
    async with TestingSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# データベースの依存関係をオーバーライド
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
async def setup_database():
    """テストデータベースのセットアップ"""
    # テーブル作成
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # テーブル削除
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


def test_root_endpoint():
    """ルートエンドポイントのテスト"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "AuraSelect API is running"
    assert data["version"] == "1.0.0"
    assert data["status"] == "healthy"


def test_health_check():
    """ヘルスチェックエンドポイントのテスト"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "aura-select-api"
    assert data["version"] == "1.0.0"


def test_openapi_schema():
    """OpenAPIスキーマのテスト"""
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert data["info"]["title"] == "AuraSelect API"


def test_docs_endpoint():
    """APIドキュメントエンドポイントのテスト"""
    response = client.get("/api/v1/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]