import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
import sys
import os

# パスの調整
sys.path.append(os.path.dirname(os.path.abspath(__file__)).replace('tests', ''))

from main import app
from app.models.product import ProductCategory, ProductStatus

client = TestClient(app)


def test_get_products_empty():
    """商品一覧取得（空の状態）のテスト"""
    response = client.get("/api/v1/products/")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "size" in data
    assert data["items"] == []
    assert data["total"] == 0


def test_create_product():
    """商品作成のテスト"""
    product_data = {
        "name": "テストシャンプー",
        "description": "テスト用のシャンプーです",
        "short_description": "テスト用シャンプー",
        "category": "shampoo",
        "brand": "Test Brand",
        "price": 1500.00,
        "trial_price": 500.00,
        "stock_quantity": 10,
        "is_trial_available": True,
        "is_featured": False
    }
    
    response = client.post("/api/v1/products/", json=product_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == product_data["name"]
    assert data["category"] == product_data["category"]
    assert float(data["price"]) == product_data["price"]
    assert data["status"] == "draft"  # デフォルトステータス


def test_get_product_by_id():
    """商品詳細取得のテスト"""
    # まず商品を作成
    product_data = {
        "name": "詳細テスト商品",
        "category": "conditioner", 
        "price": 2000.00
    }
    
    create_response = client.post("/api/v1/products/", json=product_data)
    assert create_response.status_code == 201
    created_product = create_response.json()
    product_id = created_product["id"]
    
    # 作成した商品を取得
    response = client.get(f"/api/v1/products/{product_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == product_id
    assert data["name"] == product_data["name"]


def test_get_nonexistent_product():
    """存在しない商品の取得テスト"""
    response = client.get("/api/v1/products/99999")
    assert response.status_code == 404
    data = response.json()
    assert "商品が見つかりません" in data["detail"]


def test_update_product():
    """商品更新のテスト"""
    # まず商品を作成
    product_data = {
        "name": "更新前商品",
        "category": "styling",
        "price": 1000.00
    }
    
    create_response = client.post("/api/v1/products/", json=product_data)
    product_id = create_response.json()["id"]
    
    # 商品を更新
    update_data = {
        "name": "更新後商品",
        "price": 1200.00,
        "description": "更新されたの説明"
    }
    
    response = client.put(f"/api/v1/products/{product_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert float(data["price"]) == update_data["price"]
    assert data["description"] == update_data["description"]


def test_update_product_stock():
    """商品在庫更新のテスト"""
    # 商品作成
    product_data = {
        "name": "在庫テスト商品", 
        "category": "treatment",
        "price": 800.00,
        "stock_quantity": 5
    }
    
    create_response = client.post("/api/v1/products/", json=product_data)
    product_id = create_response.json()["id"]
    
    # 在庫更新
    stock_data = {
        "stock_quantity": 15,
        "min_stock_level": 3
    }
    
    response = client.patch(f"/api/v1/products/{product_id}/stock", json=stock_data)
    assert response.status_code == 200
    data = response.json()
    assert data["stock_quantity"] == stock_data["stock_quantity"]


def test_update_product_status():
    """商品ステータス更新のテスト"""
    # 商品作成
    product_data = {
        "name": "ステータステスト商品",
        "category": "skincare", 
        "price": 1500.00
    }
    
    create_response = client.post("/api/v1/products/", json=product_data)
    product_id = create_response.json()["id"]
    
    # ステータス更新
    status_data = {"status": "active"}
    
    response = client.patch(f"/api/v1/products/{product_id}/status", json=status_data)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"


def test_toggle_product_featured():
    """商品おすすめ切り替えのテスト"""
    # 商品作成
    product_data = {
        "name": "おすすめテスト商品",
        "category": "accessories",
        "price": 500.00
    }
    
    create_response = client.post("/api/v1/products/", json=product_data)
    product_id = create_response.json()["id"]
    
    # おすすめON
    response = client.patch(f"/api/v1/products/{product_id}/featured?featured=true")
    assert response.status_code == 200
    data = response.json()
    assert data["is_featured"] == True
    
    # おすすめOFF
    response = client.patch(f"/api/v1/products/{product_id}/featured?featured=false")
    assert response.status_code == 200
    data = response.json()
    assert data["is_featured"] == False


def test_search_products():
    """商品検索のテスト"""
    # 検索対象商品を複数作成
    products = [
        {"name": "検索テスト商品A", "category": "shampoo", "price": 1000.00},
        {"name": "別の商品", "category": "conditioner", "price": 1200.00},
        {"name": "検索テスト商品B", "category": "treatment", "price": 1500.00}
    ]
    
    for product_data in products:
        client.post("/api/v1/products/", json=product_data)
    
    # 検索実行
    response = client.get("/api/v1/products/search?q=検索テスト")
    assert response.status_code == 200
    data = response.json()
    
    # 検索結果の確認（「検索テスト」を含む商品が2件）
    assert len(data["items"]) == 2
    for item in data["items"]:
        assert "検索テスト" in item["name"]


def test_delete_product():
    """商品削除のテスト"""
    # 商品作成
    product_data = {
        "name": "削除テスト商品",
        "category": "other",
        "price": 300.00
    }
    
    create_response = client.post("/api/v1/products/", json=product_data)
    product_id = create_response.json()["id"]
    
    # 商品削除
    response = client.delete(f"/api/v1/products/{product_id}")
    assert response.status_code == 204
    
    # 削除されたか確認
    get_response = client.get(f"/api/v1/products/{product_id}")
    assert get_response.status_code == 404