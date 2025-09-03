from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, validator
from ..models.product import ProductCategory, ProductStatus


class ProductBase(BaseModel):
    """商品ベーススキーマ"""
    name: str = Field(..., min_length=1, max_length=200, description="商品名")
    description: Optional[str] = Field(None, description="商品説明")
    short_description: Optional[str] = Field(None, max_length=500, description="短い説明")
    category: ProductCategory
    brand: Optional[str] = Field(None, max_length=100)
    model_number: Optional[str] = Field(None, max_length=100)
    
    price: Decimal = Field(..., gt=0, description="販売価格")
    trial_price: Optional[Decimal] = Field(None, ge=0, description="トライアル価格")
    
    is_trial_available: bool = True
    is_featured: bool = False
    
    tags: Optional[List[str]] = None
    attributes: Optional[dict] = None


class ProductCreate(ProductBase):
    """商品作成スキーマ"""
    cost_price: Optional[Decimal] = Field(None, ge=0, description="仕入れ価格")
    stock_quantity: int = Field(0, ge=0, description="在庫数")
    min_stock_level: int = Field(5, ge=0, description="最低在庫レベル")
    status: ProductStatus = ProductStatus.DRAFT
    
    @validator('trial_price')
    def validate_trial_price(cls, v, values):
        if v is not None and 'price' in values:
            if v >= values['price']:
                raise ValueError('トライアル価格は販売価格より安く設定してください')
        return v


class ProductUpdate(BaseModel):
    """商品更新スキーマ"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    category: Optional[ProductCategory] = None
    brand: Optional[str] = Field(None, max_length=100)
    model_number: Optional[str] = Field(None, max_length=100)
    
    price: Optional[Decimal] = Field(None, gt=0)
    cost_price: Optional[Decimal] = Field(None, ge=0)
    trial_price: Optional[Decimal] = Field(None, ge=0)
    
    stock_quantity: Optional[int] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    status: Optional[ProductStatus] = None
    
    is_trial_available: Optional[bool] = None
    is_featured: Optional[bool] = None
    
    image_urls: Optional[List[str]] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None
    attributes: Optional[dict] = None


class ProductResponse(ProductBase):
    """商品レスポンススキーマ"""
    id: int
    slug: Optional[str]
    stock_quantity: int
    min_stock_level: int
    status: ProductStatus
    image_urls: Optional[List[str]]
    thumbnail_url: Optional[str]
    creator_id: Optional[int]
    is_low_stock: bool
    profit_margin: Optional[float]
    
    class Config:
        from_attributes = True


class ProductListItem(BaseModel):
    """商品一覧アイテムスキーマ"""
    id: int
    name: str
    category: ProductCategory
    brand: Optional[str]
    price: Decimal
    trial_price: Optional[Decimal]
    stock_quantity: int
    status: ProductStatus
    is_trial_available: bool
    is_featured: bool
    thumbnail_url: Optional[str]
    is_low_stock: bool
    
    class Config:
        from_attributes = True


class ProductStockUpdate(BaseModel):
    """在庫更新スキーマ"""
    stock_quantity: int = Field(..., ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)


class ProductStatusUpdate(BaseModel):
    """ステータス更新スキーマ"""
    status: ProductStatus


# 検索・フィルタリング用スキーマ
class ProductFilter(BaseModel):
    """商品フィルタースキーマ"""
    category: Optional[ProductCategory] = None
    status: Optional[ProductStatus] = None
    brand: Optional[str] = None
    is_trial_available: Optional[bool] = None
    is_featured: Optional[bool] = None
    min_price: Optional[Decimal] = Field(None, ge=0)
    max_price: Optional[Decimal] = Field(None, ge=0)
    in_stock: Optional[bool] = None  # 在庫ありのみ
    low_stock: Optional[bool] = None  # 在庫不足のみ
    
    @validator('max_price')
    def validate_price_range(cls, v, values):
        if v is not None and 'min_price' in values and values['min_price'] is not None:
            if v <= values['min_price']:
                raise ValueError('最大価格は最小価格より大きく設定してください')
        return v


class ProductSearchQuery(BaseModel):
    """商品検索クエリスキーマ"""
    q: Optional[str] = Field(None, min_length=1, description="検索キーワード")
    category: Optional[ProductCategory] = None
    status: Optional[ProductStatus] = None
    page: int = Field(1, ge=1, description="ページ番号")
    size: int = Field(20, ge=1, le=100, description="ページサイズ")