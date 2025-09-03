from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator
from ..models.trial_request import TrialStatus


class TrialRequestBase(BaseModel):
    """トライアルリクエストベーススキーマ"""
    product_id: int = Field(..., description="商品ID")
    quantity: int = Field(1, ge=1, le=10, description="数量")
    trial_duration_days: int = Field(7, ge=1, le=30, description="トライアル期間（日）")
    reason: Optional[str] = Field(None, max_length=1000, description="申込理由")
    customer_notes: Optional[str] = Field(None, max_length=1000, description="顧客メモ")
    preferred_start_date: Optional[datetime] = Field(None, description="希望開始日")


class TrialRequestCreate(TrialRequestBase):
    """トライアルリクエスト作成スキーマ"""
    pass


class TrialRequestUpdate(BaseModel):
    """トライアルリクエスト更新スキーマ（顧客用）"""
    reason: Optional[str] = Field(None, max_length=1000)
    customer_notes: Optional[str] = Field(None, max_length=1000)
    preferred_start_date: Optional[datetime] = None


class TrialRequestStaffUpdate(BaseModel):
    """トライアルリクエスト更新スキーマ（スタッフ用）"""
    status: Optional[TrialStatus] = None
    staff_notes: Optional[str] = Field(None, max_length=1000, description="スタッフメモ")
    actual_start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None


class TrialRequestStatusUpdate(BaseModel):
    """ステータス更新スキーマ"""
    status: TrialStatus
    staff_notes: Optional[str] = Field(None, max_length=1000)
    
    @validator('status')
    def validate_status_transition(cls, v):
        # 特定の状態遷移のみ許可（実際の業務ルールに応じて調整）
        allowed_statuses = [
            TrialStatus.APPROVED, 
            TrialStatus.REJECTED, 
            TrialStatus.IN_PROGRESS,
            TrialStatus.COMPLETED, 
            TrialStatus.CANCELLED
        ]
        if v not in allowed_statuses:
            raise ValueError(f'無効なステータスです: {v}')
        return v


class TrialRequestFeedback(BaseModel):
    """フィードバック・評価スキーマ"""
    customer_rating: int = Field(..., ge=1, le=5, description="総合評価（1-5）")
    effectiveness_rating: int = Field(..., ge=1, le=5, description="効果評価（1-5）")
    customer_review: Optional[str] = Field(None, max_length=2000, description="レビュー")
    purchase_intent: bool = Field(..., description="購入意向")


class TrialRequestResponse(TrialRequestBase):
    """トライアルリクエストレスポンススキーマ"""
    id: int
    customer_id: int
    status: TrialStatus
    unit_price: Decimal
    total_price: Decimal
    staff_notes: Optional[str]
    
    # 日程情報
    actual_start_date: Optional[datetime]
    completion_date: Optional[datetime]
    
    # 承認情報
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    processed_by: Optional[int]
    
    # フィードバック
    customer_rating: Optional[int]
    customer_review: Optional[str]
    effectiveness_rating: Optional[int]
    purchase_intent: Optional[bool]
    
    # システム情報
    created_at: datetime
    updated_at: datetime
    
    # 計算プロパティ
    is_active: bool
    is_completed: bool
    can_be_rated: bool
    
    class Config:
        from_attributes = True


class TrialRequestListItem(BaseModel):
    """トライアルリクエスト一覧アイテム"""
    id: int
    customer_id: int
    product_id: int
    status: TrialStatus
    quantity: int
    total_price: Decimal
    preferred_start_date: Optional[datetime]
    actual_start_date: Optional[datetime]
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


class TrialRequestWithDetails(TrialRequestResponse):
    """詳細情報付きトライアルリクエスト"""
    # 関連データ（別途JOINまたは個別取得で追加）
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    product_name: Optional[str] = None
    product_category: Optional[str] = None


# フィルタ・検索用スキーマ
class TrialRequestFilter(BaseModel):
    """トライアルリクエストフィルタースキーマ"""
    status: Optional[TrialStatus] = None
    product_id: Optional[int] = None
    customer_id: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    has_feedback: Optional[bool] = None  # フィードバック済みかどうか
    
    @validator('date_to')
    def validate_date_range(cls, v, values):
        if v is not None and 'date_from' in values and values['date_from'] is not None:
            if v <= values['date_from']:
                raise ValueError('終了日は開始日より後に設定してください')
        return v


class TrialRequestSearchQuery(BaseModel):
    """トライアルリクエスト検索クエリ"""
    status: Optional[TrialStatus] = None
    customer_email: Optional[str] = Field(None, description="顧客メールアドレス")
    product_name: Optional[str] = Field(None, description="商品名（部分一致）")
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)