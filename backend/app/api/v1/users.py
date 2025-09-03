from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...crud import user as crud_user
from ...models.user import UserRole
from ...schemas.user import (
    UserCreate, UserUpdate, UserResponse, UserProfile, UserListResponse,
    UserLogin, PasswordChange
)
from ...schemas.common import PaginatedResponse

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[UserListResponse])
async def get_users(
    page: int = Query(1, ge=1, description="ページ番号"),
    size: int = Query(20, ge=1, le=100, description="ページサイズ"),
    role: Optional[UserRole] = Query(None, description="ロールフィルタ"),
    is_active: Optional[bool] = Query(None, description="アクティブ状態フィルタ"),
    is_verified: Optional[bool] = Query(None, description="認証状態フィルタ"),
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_admin_user)
):
    """ユーザー一覧を取得（管理者のみ）"""
    skip = (page - 1) * size
    
    # TODO: フィルタリング機能を実装
    users = await crud_user.get_multi(db, skip=skip, limit=size)
    total = await crud_user.get_count(db)
    
    return PaginatedResponse[UserListResponse](
        items=[UserListResponse.model_validate(user) for user in users],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    # current_user: User = Depends(get_current_active_user)  # TODO: 認証実装後
    user_id: int = Query(..., description="ユーザーID"),  # 仮の実装
    db: AsyncSession = Depends(get_db)
):
    """現在のユーザーのプロファイルを取得"""
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )
    return UserProfile.model_validate(user)


@router.put("/me", response_model=UserProfile)
async def update_current_user_profile(
    user_update: UserUpdate,
    user_id: int = Query(..., description="ユーザーID"),  # 仮の実装
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_active_user)
):
    """現在のユーザーのプロファイルを更新"""
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )
    
    updated_user = await crud_user.update(db, db_obj=user, obj_in=user_update)
    return UserProfile.model_validate(updated_user)


@router.post("/me/change-password", response_model=dict)
async def change_password(
    password_change: PasswordChange,
    user_id: int = Query(..., description="ユーザーID"),  # 仮の実装
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_active_user)
):
    """現在のユーザーのパスワードを変更"""
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )
    
    # 現在のパスワードを確認
    if not crud_user.verify_password(password_change.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="現在のパスワードが正しくありません"
        )
    
    # 新しいパスワードに更新
    await crud_user.update_password(db, user=user, new_password=password_change.new_password)
    return {"message": "パスワードが正常に変更されました"}


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_staff_user)
):
    """特定ユーザーの情報を取得"""
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )
    return UserResponse.model_validate(user)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_admin_user)
):
    """新しいユーザーを作成（管理者のみ）"""
    # メールアドレスの重複チェック
    existing_user = await crud_user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています"
        )
    
    # ユーザー名の重複チェック（設定されている場合）
    if user_in.username:
        existing_username = await crud_user.get_by_username(db, username=user_in.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このユーザー名は既に使用されています"
            )
    
    user = await crud_user.create(db, obj_in=user_in)
    return UserResponse.model_validate(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_admin_user)
):
    """ユーザー情報を更新（管理者のみ）"""
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )
    
    updated_user = await crud_user.update(db, db_obj=user, obj_in=user_update)
    return UserResponse.model_validate(updated_user)


@router.patch("/{user_id}/verify", response_model=UserResponse)
async def verify_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_admin_user)
):
    """ユーザーを認証済みに設定（管理者のみ）"""
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )
    
    verified_user = await crud_user.verify_user(db, user=user)
    return UserResponse.model_validate(verified_user)


@router.patch("/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_admin_user)
):
    """ユーザーを非アクティブに設定（管理者のみ）"""
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )
    
    deactivated_user = await crud_user.deactivate_user(db, user=user)
    return UserResponse.model_validate(deactivated_user)


@router.patch("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_admin_user)
):
    """ユーザーをアクティブに設定（管理者のみ）"""
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )
    
    user.is_active = True
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.model_validate(user)


# ロール別ユーザー取得
@router.get("/role/customers", response_model=PaginatedResponse[UserListResponse])
async def get_customers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_staff_user)
):
    """顧客ユーザー一覧を取得"""
    # TODO: ロールフィルタリング機能を実装
    skip = (page - 1) * size
    users = await crud_user.get_multi(db, skip=skip, limit=size)
    # 顧客のみにフィルタリング（実装時）
    customer_users = [user for user in users if user.role == UserRole.CUSTOMER]
    total = len(customer_users)
    
    return PaginatedResponse[UserListResponse](
        items=[UserListResponse.model_validate(user) for user in customer_users],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/role/staff", response_model=PaginatedResponse[UserListResponse])
async def get_staff_users(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_admin_user)
):
    """スタッフユーザー一覧を取得（管理者のみ）"""
    skip = (page - 1) * size
    users = await crud_user.get_multi(db, skip=skip, limit=size)
    # スタッフのみにフィルタリング
    staff_users = [
        user for user in users 
        if user.role in [UserRole.ADMIN, UserRole.MANAGER, UserRole.STYLIST]
    ]
    total = len(staff_users)
    
    return PaginatedResponse[UserListResponse](
        items=[UserListResponse.model_validate(user) for user in staff_users],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


# 認証関連エンドポイント（基本実装）
@router.post("/authenticate", response_model=dict)
async def authenticate_user(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """ユーザー認証（基本実装）"""
    user = await crud_user.authenticate(
        db, email=login_data.email, password=login_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません"
        )
    
    if not await crud_user.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このアカウントは無効化されています"
        )
    
    # TODO: JWTトークン生成を実装
    return {
        "message": "認証成功",
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }