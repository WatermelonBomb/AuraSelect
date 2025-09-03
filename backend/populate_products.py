"""
サンプル商品データを追加するスクリプト
"""
import asyncio
from decimal import Decimal
from app.db.database import async_session_maker
from app.models.product import Product, ProductCategory, ProductStatus


sample_products = [
    {
        "name": "プレミアムシャンプー",
        "description": "髪と頭皮に優しい天然成分配合のプレミアムシャンプー",
        "short_description": "天然成分配合で髪に優しい",
        "category": ProductCategory.SHAMPOO,
        "brand": "AuraSelect",
        "price": Decimal("3500"),
        "trial_price": Decimal("1500"),
        "stock_quantity": 50,
        "status": ProductStatus.ACTIVE,
        "is_trial_available": True,
        "is_featured": True,
        "attributes": {
            "hair_type": ["normal", "dry", "damaged"],
            "effects": ["moisturizing", "repairing", "shine"]
        }
    },
    {
        "name": "リペアトリートメント",
        "description": "ダメージヘア専用の集中補修トリートメント",
        "short_description": "ダメージヘアを集中補修",
        "category": ProductCategory.TREATMENT,
        "brand": "AuraSelect",
        "price": Decimal("4200"),
        "trial_price": Decimal("2000"),
        "stock_quantity": 30,
        "status": ProductStatus.ACTIVE,
        "is_trial_available": True,
        "is_featured": True,
        "attributes": {
            "hair_type": ["damaged", "dry", "chemically_treated"],
            "effects": ["repairing", "strengthening", "smoothing"]
        }
    },
    {
        "name": "ボリュームアップスタイリング剤",
        "description": "髪にボリュームと質感を与えるスタイリング剤",
        "short_description": "ボリュームアップ効果",
        "category": ProductCategory.STYLING,
        "brand": "AuraSelect",
        "price": Decimal("2800"),
        "trial_price": Decimal("1200"),
        "stock_quantity": 25,
        "status": ProductStatus.ACTIVE,
        "is_trial_available": True,
        "attributes": {
            "hair_type": ["fine", "normal", "oily"],
            "effects": ["volume", "texture", "hold"]
        }
    },
    {
        "name": "カラーケアコンディショナー",
        "description": "カラーリング後の髪色を長持ちさせる専用コンディショナー",
        "short_description": "カラー持続効果",
        "category": ProductCategory.CONDITIONER,
        "brand": "AuraSelect",
        "price": Decimal("3800"),
        "trial_price": Decimal("1800"),
        "stock_quantity": 40,
        "status": ProductStatus.ACTIVE,
        "is_trial_available": True,
        "attributes": {
            "hair_type": ["colored", "chemically_treated"],
            "effects": ["color_protection", "moisturizing", "uv_protection"]
        }
    },
    {
        "name": "スキンケアクリーム",
        "description": "美容室専用の高保湿スキンケアクリーム",
        "short_description": "高保湿スキンケア",
        "category": ProductCategory.SKINCARE,
        "brand": "AuraSelect",
        "price": Decimal("5200"),
        "trial_price": Decimal("2500"),
        "stock_quantity": 20,
        "status": ProductStatus.ACTIVE,
        "is_trial_available": True,
        "attributes": {
            "skin_type": ["dry", "normal", "sensitive"],
            "effects": ["moisturizing", "anti_aging", "smoothing"]
        }
    }
]


async def populate_products():
    async with async_session_maker() as session:
        try:
            # 既存の商品数をチェック
            from sqlalchemy import select
            result = await session.execute(select(Product))
            existing_products = result.scalars().all()
            
            if existing_products:
                print(f"既に {len(existing_products)} 個の商品が存在します")
                return
            
            # サンプル商品を追加
            for product_data in sample_products:
                product = Product(**product_data)
                session.add(product)
            
            await session.commit()
            print(f"{len(sample_products)} 個のサンプル商品を追加しました")
            
            # 追加された商品を確認
            result = await session.execute(select(Product))
            products = result.scalars().all()
            print("\n追加された商品:")
            for product in products:
                print(f"- ID: {product.id}, 名前: {product.name}, 価格: {product.price}")
                
        except Exception as e:
            await session.rollback()
            print(f"エラーが発生しました: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(populate_products())