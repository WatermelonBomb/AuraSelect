from enum import Enum
from typing import Optional, List
from decimal import Decimal
from sqlalchemy import String, Text, Integer, Numeric, Boolean, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import mapped_column, Mapped, relationship
from .base import BaseModel


class ProductCategory(str, Enum):
    """商品カテゴリ"""
    SHAMPOO = "shampoo"
    CONDITIONER = "conditioner"
    TREATMENT = "treatment"
    STYLING = "styling"
    COLOR = "color"
    SKINCARE = "skincare"
    TOOLS = "tools"
    ACCESSORIES = "accessories"
    OTHER = "other"


class ProductStatus(str, Enum):
    """商品ステータス"""
    ACTIVE = "active"      # 販売中
    INACTIVE = "inactive"  # 停止中
    DRAFT = "draft"        # 下書き
    ARCHIVED = "archived"  # アーカイブ済み


class Product(BaseModel):
    """商品モデル"""
    __tablename__ = "products"
    
    # 基本情報
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    short_description: Mapped[Optional[str]] = mapped_column(String(500))
    
    # 分類
    category: Mapped[ProductCategory] = mapped_column(SQLEnum(ProductCategory), nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String(100))
    model_number: Mapped[Optional[str]] = mapped_column(String(100))
    
    # 価格
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    cost_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))  # 仕入れ価格
    trial_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))  # トライアル価格
    
    # 在庫
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    min_stock_level: Mapped[int] = mapped_column(Integer, default=5)  # 最低在庫レベル
    
    # ステータス・設定
    status: Mapped[ProductStatus] = mapped_column(SQLEnum(ProductStatus), default=ProductStatus.DRAFT)
    is_trial_available: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)  # おすすめ商品
    
    # 画像・メディア
    image_urls: Mapped[Optional[List[str]]] = mapped_column(JSON)  # 商品画像URL
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # SEO・メタデータ
    slug: Mapped[Optional[str]] = mapped_column(String(200), unique=True, index=True)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON)  # タグ
    
    # 外部キー
    creator_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    
    # 特徴・属性（JSON形式で柔軟に格納）
    attributes: Mapped[Optional[dict]] = mapped_column(JSON)  # 髪質適性、効果など
    
    # リレーション
    # creator: Mapped[Optional["User"]] = relationship("User", back_populates="products")
    # trial_requests: Mapped[List["TrialRequest"]] = relationship("TrialRequest", back_populates="product")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, category={self.category}, price={self.price})>"
        
    @property
    def is_low_stock(self) -> bool:
        """在庫不足かチェック"""
        return self.stock_quantity <= self.min_stock_level
        
    @property
    def profit_margin(self) -> Optional[float]:
        """利益率を計算"""
        if self.cost_price and self.cost_price > 0:
            return float((self.price - self.cost_price) / self.price * 100)
        return None