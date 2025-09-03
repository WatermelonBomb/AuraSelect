from enum import Enum
from typing import Optional, List
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
from sqlalchemy import String, Boolean, Text, Enum as SQLEnum, Integer
from sqlalchemy.orm import mapped_column, Mapped, relationship
from .base import BaseModel


class UserRole(str, Enum):
    """ユーザーロール"""
    ADMIN = "admin"          # 管理者
    MANAGER = "manager"      # 店長
    STYLIST = "stylist"      # 美容師
    CUSTOMER = "customer"    # 顧客


class User(SQLAlchemyBaseUserTable[int], BaseModel):
    """ユーザーモデル"""
    __tablename__ = "users"
    
    # 基本情報（emailとhashed_passwordはSQLAlchemyBaseUserTableで提供）
    username: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(200))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    
    # 権限・ロール
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.CUSTOMER)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # プロファイル情報
    bio: Mapped[Optional[str]] = mapped_column(Text)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # 顧客向けフィールド
    hair_type: Mapped[Optional[str]] = mapped_column(String(100))  # 髪質
    skin_type: Mapped[Optional[str]] = mapped_column(String(100))  # 肌質
    allergies: Mapped[Optional[str]] = mapped_column(Text)         # アレルギー情報
    preferences: Mapped[Optional[str]] = mapped_column(Text)       # 好み・要望
    
    # リレーション（後で定義）
    # products: Mapped[List["Product"]] = relationship("Product", back_populates="creator")
    # trial_requests: Mapped[List["TrialRequest"]] = relationship("TrialRequest", back_populates="customer")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"