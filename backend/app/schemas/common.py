from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, Field


# ジェネリック型定義
T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    """ページネーションレスポンススキーマ"""
    items: List[T]
    total: int = Field(..., description="総アイテム数")
    page: int = Field(..., description="現在のページ")
    size: int = Field(..., description="ページサイズ") 
    pages: int = Field(..., description="総ページ数")
    has_next: bool = Field(..., description="次ページがあるか")
    has_prev: bool = Field(..., description="前ページがあるか")


class SuccessResponse(BaseModel):
    """成功レスポンススキーマ"""
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """エラーレスポンススキーマ"""
    success: bool = False
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


class HealthCheck(BaseModel):
    """ヘルスチェックスキーマ"""
    status: str = "healthy"
    service: str = "aura-select-api"
    version: str = "1.0.0"
    timestamp: str


class ValidationErrorDetail(BaseModel):
    """バリデーションエラー詳細"""
    field: str
    message: str
    type: str


class ValidationErrorResponse(BaseModel):
    """バリデーションエラーレスポンス"""
    success: bool = False
    error: str = "Validation Error"
    details: List[ValidationErrorDetail]