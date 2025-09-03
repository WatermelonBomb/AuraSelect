from typing import List, Optional
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from .base import CRUDBase
from ..models.product import Product, ProductCategory, ProductStatus
from ..schemas.product import ProductCreate, ProductUpdate, ProductFilter


class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    """商品CRUD操作"""
    
    async def get_by_slug(self, db: AsyncSession, *, slug: str) -> Optional[Product]:
        """スラッグで商品を取得"""
        result = await db.execute(select(Product).where(Product.slug == slug))
        return result.scalar_one_or_none()
    
    async def get_active_products(
        self, 
        db: AsyncSession, 
        *, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Product]:
        """アクティブな商品一覧を取得"""
        result = await db.execute(
            select(Product)
            .where(Product.status == ProductStatus.ACTIVE)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_category(
        self, 
        db: AsyncSession, 
        *, 
        category: ProductCategory,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Product]:
        """カテゴリ別商品一覧を取得"""
        result = await db.execute(
            select(Product)
            .where(Product.category == category)
            .where(Product.status == ProductStatus.ACTIVE)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def search_products(
        self,
        db: AsyncSession,
        *,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """商品を検索"""
        search_filter = or_(
            Product.name.ilike(f"%{query}%"),
            Product.description.ilike(f"%{query}%"),
            Product.brand.ilike(f"%{query}%")
        )
        
        result = await db.execute(
            select(Product)
            .where(search_filter)
            .where(Product.status == ProductStatus.ACTIVE)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_filtered_products(
        self,
        db: AsyncSession,
        *,
        filters: ProductFilter,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """フィルタリングされた商品一覧を取得"""
        query = select(Product)
        conditions = []
        
        if filters.category:
            conditions.append(Product.category == filters.category)
        
        if filters.status:
            conditions.append(Product.status == filters.status)
        
        if filters.brand:
            conditions.append(Product.brand.ilike(f"%{filters.brand}%"))
        
        if filters.is_trial_available is not None:
            conditions.append(Product.is_trial_available == filters.is_trial_available)
        
        if filters.is_featured is not None:
            conditions.append(Product.is_featured == filters.is_featured)
        
        if filters.min_price is not None:
            conditions.append(Product.price >= filters.min_price)
        
        if filters.max_price is not None:
            conditions.append(Product.price <= filters.max_price)
        
        if filters.in_stock:
            conditions.append(Product.stock_quantity > 0)
        
        if filters.low_stock:
            conditions.append(Product.stock_quantity <= Product.min_stock_level)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())
    
    async def get_featured_products(
        self,
        db: AsyncSession,
        *,
        limit: int = 10
    ) -> List[Product]:
        """おすすめ商品を取得"""
        result = await db.execute(
            select(Product)
            .where(Product.is_featured == True)
            .where(Product.status == ProductStatus.ACTIVE)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_low_stock_products(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """在庫不足商品を取得"""
        result = await db.execute(
            select(Product)
            .where(Product.stock_quantity <= Product.min_stock_level)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def update_stock(
        self,
        db: AsyncSession,
        *,
        product_id: int,
        quantity_change: int
    ) -> Optional[Product]:
        """在庫数を更新"""
        product = await self.get(db, id=product_id)
        if not product:
            return None
        
        new_quantity = product.stock_quantity + quantity_change
        if new_quantity < 0:
            new_quantity = 0
        
        product.stock_quantity = new_quantity
        db.add(product)
        await db.commit()
        await db.refresh(product)
        return product
    
    async def set_featured(
        self,
        db: AsyncSession,
        *,
        product_id: int,
        featured: bool
    ) -> Optional[Product]:
        """おすすめ設定を更新"""
        product = await self.get(db, id=product_id)
        if not product:
            return None
        
        product.is_featured = featured
        db.add(product)
        await db.commit()
        await db.refresh(product)
        return product
    
    async def change_status(
        self,
        db: AsyncSession,
        *,
        product_id: int,
        status: ProductStatus
    ) -> Optional[Product]:
        """商品ステータスを変更"""
        product = await self.get(db, id=product_id)
        if not product:
            return None
        
        product.status = status
        db.add(product)
        await db.commit()
        await db.refresh(product)
        return product


# CRUDインスタンス
product = CRUDProduct(Product)