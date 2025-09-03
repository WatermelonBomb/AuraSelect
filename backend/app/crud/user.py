from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from .base import CRUDBase
from ..models.user import User, UserRole
from ..schemas.user import UserCreate, UserUpdate

# パスワードハッシュ化設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """ユーザーCRUD操作"""
    
    def get_password_hash(self, password: str) -> str:
        """パスワードをハッシュ化"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """パスワードを検証"""
        return pwd_context.verify(plain_password, hashed_password)
    
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        """メールアドレスでユーザーを取得"""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def get_by_username(self, db: AsyncSession, *, username: str) -> Optional[User]:
        """ユーザー名でユーザーを取得"""
        result = await db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()
    
    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        """新しいユーザーを作成"""
        # パスワードをハッシュ化
        hashed_password = self.get_password_hash(obj_in.password)
        
        # ユーザーオブジェクトを作成
        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            full_name=obj_in.full_name,
            phone=obj_in.phone,
            bio=obj_in.bio,
            avatar_url=obj_in.avatar_url,
            hashed_password=hashed_password,
            role=obj_in.role,
            hair_type=obj_in.hair_type,
            skin_type=obj_in.skin_type,
            allergies=obj_in.allergies,
            preferences=obj_in.preferences,
            is_active=True,
            is_verified=False
        )
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def authenticate(
        self, 
        db: AsyncSession, 
        *, 
        email: str, 
        password: str
    ) -> Optional[User]:
        """ユーザー認証"""
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    async def is_active(self, user: User) -> bool:
        """ユーザーがアクティブかチェック"""
        return user.is_active
    
    async def is_verified(self, user: User) -> bool:
        """ユーザーが認証済みかチェック"""
        return user.is_verified
    
    async def has_role(self, user: User, role: UserRole) -> bool:
        """ユーザーが特定のロールを持っているかチェック"""
        return user.role == role
    
    async def is_staff(self, user: User) -> bool:
        """ユーザーがスタッフ権限を持っているかチェック"""
        return user.role in [UserRole.ADMIN, UserRole.MANAGER, UserRole.STYLIST]
    
    async def update_password(
        self, 
        db: AsyncSession, 
        *, 
        user: User, 
        new_password: str
    ) -> User:
        """パスワードを更新"""
        hashed_password = self.get_password_hash(new_password)
        user.hashed_password = hashed_password
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    
    async def verify_user(self, db: AsyncSession, *, user: User) -> User:
        """ユーザーを認証済みに設定"""
        user.is_verified = True
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    
    async def deactivate_user(self, db: AsyncSession, *, user: User) -> User:
        """ユーザーを非アクティブに設定"""
        user.is_active = False
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user


# CRUDインスタンス
user = CRUDUser(User)