from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...crud import product as crud_product
from ...models.product import ProductStatus
from ...schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListItem,
    ProductStockUpdate, ProductStatusUpdate, ProductSearchQuery, ProductFilter
)
from ...schemas.common import PaginatedResponse

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ProductListItem])
async def get_products(
    page: int = Query(1, ge=1, description="ページ番号"),
    size: int = Query(20, ge=1, le=100, description="ページサイズ"),
    category: Optional[str] = Query(None, description="カテゴリフィルタ"),
    status: Optional[ProductStatus] = Query(None, description="ステータスフィルタ"),
    brand: Optional[str] = Query(None, description="ブランドフィルタ"),
    is_featured: Optional[bool] = Query(None, description="おすすめ商品のみ"),
    in_stock: Optional[bool] = Query(None, description="在庫ありのみ"),
    db: AsyncSession = Depends(get_db)
):
    """商品一覧を取得"""
    skip = (page - 1) * size
    
    # フィルタを適用
    filters = ProductFilter(
        category=category,
        status=status,
        brand=brand,
        is_featured=is_featured,
        in_stock=in_stock
    )
    
    products = await crud_product.get_filtered_products(
        db, filters=filters, skip=skip, limit=size
    )
    total = await crud_product.get_count(db)
    
    return PaginatedResponse[ProductListItem](
        items=[ProductListItem.model_validate(product) for product in products],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/search", response_model=PaginatedResponse[ProductListItem])
async def search_products(
    q: str = Query(..., min_length=1, description="検索キーワード"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """商品を検索"""
    skip = (page - 1) * size
    
    products = await crud_product.search_products(
        db, query=q, skip=skip, limit=size
    )
    total = len(products)  # 検索結果の簡易カウント
    
    return PaginatedResponse[ProductListItem](
        items=[ProductListItem.model_validate(product) for product in products],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/featured", response_model=List[ProductListItem])
async def get_featured_products(
    limit: int = Query(10, ge=1, le=50, description="取得件数"),
    db: AsyncSession = Depends(get_db)
):
    """おすすめ商品一覧を取得"""
    products = await crud_product.get_featured_products(db, limit=limit)
    return [ProductListItem.model_validate(product) for product in products]


@router.get("/low-stock", response_model=PaginatedResponse[ProductListItem])
async def get_low_stock_products(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """在庫不足商品一覧を取得"""
    skip = (page - 1) * size
    products = await crud_product.get_low_stock_products(db, skip=skip, limit=size)
    total = len(products)
    
    return PaginatedResponse[ProductListItem](
        items=[ProductListItem.model_validate(product) for product in products],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size,
        has_next=page * size < total,
        has_prev=page > 1
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """商品詳細を取得"""
    product = await crud_product.get(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品が見つかりません"
        )
    return ProductResponse.model_validate(product)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_active_user)  # 認証実装後に追加
):
    """新しい商品を作成"""
    product = await crud_product.create(db, obj_in=product_in)
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_active_user)
):
    """商品を更新"""
    product = await crud_product.get(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品が見つかりません"
        )
    
    product = await crud_product.update(db, db_obj=product, obj_in=product_in)
    return ProductResponse.model_validate(product)


@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def update_product_stock(
    product_id: int,
    stock_update: ProductStockUpdate,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_active_user)
):
    """商品在庫を更新"""
    product = await crud_product.get(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品が見つかりません"
        )
    
    # 在庫数の更新
    quantity_change = stock_update.stock_quantity - product.stock_quantity
    updated_product = await crud_product.update_stock(
        db, product_id=product_id, quantity_change=quantity_change
    )
    
    # 最低在庫レベルも更新（指定されている場合）
    if stock_update.min_stock_level is not None:
        updated_product.min_stock_level = stock_update.min_stock_level
        db.add(updated_product)
        await db.commit()
        await db.refresh(updated_product)
    
    return ProductResponse.model_validate(updated_product)


@router.patch("/{product_id}/status", response_model=ProductResponse)
async def update_product_status(
    product_id: int,
    status_update: ProductStatusUpdate,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_active_user)
):
    """商品ステータスを更新"""
    product = await crud_product.change_status(
        db, product_id=product_id, status=status_update.status
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品が見つかりません"
        )
    return ProductResponse.model_validate(product)


@router.patch("/{product_id}/featured", response_model=ProductResponse)
async def toggle_product_featured(
    product_id: int,
    featured: bool = Query(..., description="おすすめ設定"),
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_active_user)
):
    """商品のおすすめ設定を切り替え"""
    product = await crud_product.set_featured(
        db, product_id=product_id, featured=featured
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品が見つかりません"
        )
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
    # TODO: current_user: User = Depends(get_current_active_user)
):
    """商品を削除"""
    product = await crud_product.remove(db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品が見つかりません"
        )
    return None