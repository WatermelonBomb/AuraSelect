from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from fastapi_users import schemas
from ..models.user import UserRole


class UserBase(BaseModel):
    """ユーザーベーススキーマ"""
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserRead(schemas.BaseUser[int]):
    """ユーザー読み取り用スキーマ（FastAPI Users準拠）"""
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    hair_type: Optional[str] = None
    skin_type: Optional[str] = None
    allergies: Optional[str] = None
    preferences: Optional[str] = None


class UserCreate(schemas.BaseUserCreate):
    """ユーザー作成スキーマ（FastAPI Users準拠）"""
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # 顧客向けフィールド（任意）
    hair_type: Optional[str] = None
    skin_type: Optional[str] = None
    allergies: Optional[str] = None
    preferences: Optional[str] = None


class UserUpdate(schemas.BaseUserUpdate):
    """ユーザー更新スキーマ（FastAPI Users準拠）"""
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # 顧客向けフィールド
    hair_type: Optional[str] = None
    skin_type: Optional[str] = None
    allergies: Optional[str] = None
    preferences: Optional[str] = None


class UserResponse(UserBase):
    """ユーザーレスポンススキーマ"""
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    
    # 顧客向けフィールド
    hair_type: Optional[str] = None
    skin_type: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserProfile(UserResponse):
    """ユーザープロファイルスキーマ（詳細情報付き）"""
    allergies: Optional[str] = None
    preferences: Optional[str] = None
    
    
class UserListResponse(BaseModel):
    """ユーザー一覧レスポンス"""
    id: int
    email: EmailStr
    username: Optional[str]
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    is_verified: bool
    
    class Config:
        from_attributes = True


# 認証関連スキーマ
class Token(BaseModel):
    """トークンスキーマ"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: Optional[str] = None


class UserLogin(BaseModel):
    """ログインスキーマ"""
    email: EmailStr
    password: str


class PasswordChange(BaseModel):
    """パスワード変更スキーマ"""
    current_password: str
    new_password: str = Field(..., min_length=8)