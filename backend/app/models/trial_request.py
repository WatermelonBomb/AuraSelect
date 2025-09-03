from enum import Enum
from typing import Optional
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Text, Integer, Numeric, ForeignKey, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.orm import mapped_column, Mapped, relationship
from .base import BaseModel


class TrialStatus(str, Enum):
    """トライアルステータス"""
    PENDING = "pending"        # 申込中
    APPROVED = "approved"      # 承認済み
    REJECTED = "rejected"      # 却下
    IN_PROGRESS = "in_progress" # 実施中
    COMPLETED = "completed"    # 完了
    CANCELLED = "cancelled"    # キャンセル


class TrialRequest(BaseModel):
    """トライアルリクエストモデル"""
    __tablename__ = "trial_requests"
    
    # 基本情報
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    
    # ステータス
    status: Mapped[TrialStatus] = mapped_column(SQLEnum(TrialStatus), default=TrialStatus.PENDING)
    
    # 申込内容
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    trial_duration_days: Mapped[int] = mapped_column(Integer, default=7)  # トライアル期間
    
    # 価格情報
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # 申込理由・メモ
    reason: Mapped[Optional[str]] = mapped_column(Text)  # 申込理由
    customer_notes: Mapped[Optional[str]] = mapped_column(Text)  # 顧客メモ
    staff_notes: Mapped[Optional[str]] = mapped_column(Text)     # スタッフメモ
    
    # 日程
    preferred_start_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    actual_start_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completion_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # 承認・処理情報
    approved_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    processed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    
    # フィードバック・評価
    customer_rating: Mapped[Optional[int]] = mapped_column(Integer)  # 1-5評価
    customer_review: Mapped[Optional[str]] = mapped_column(Text)
    effectiveness_rating: Mapped[Optional[int]] = mapped_column(Integer)  # 効果評価
    purchase_intent: Mapped[Optional[bool]] = mapped_column()  # 購入意向
    
    # 追加データ（JSON）
    additional_data: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # リレーション
    # customer: Mapped["User"] = relationship("User", foreign_keys=[customer_id], back_populates="trial_requests")
    # product: Mapped["Product"] = relationship("Product", back_populates="trial_requests")
    # approved_by_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by])
    # processed_by_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[processed_by])
    
    def __repr__(self):
        return f"<TrialRequest(id={self.id}, customer_id={self.customer_id}, product_id={self.product_id}, status={self.status})>"
        
    @property
    def is_active(self) -> bool:
        """アクティブなトライアルかチェック"""
        return self.status in [TrialStatus.PENDING, TrialStatus.APPROVED, TrialStatus.IN_PROGRESS]
        
    @property
    def is_completed(self) -> bool:
        """完了済みかチェック"""
        return self.status == TrialStatus.COMPLETED
        
    @property 
    def can_be_rated(self) -> bool:
        """評価可能かチェック"""
        return self.status == TrialStatus.COMPLETED and self.customer_rating is None