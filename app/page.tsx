"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import CustomerView from "@/components/views/CustomerView"
import StaffDashboard from "@/components/views/StaffDashboard"
import AdminView from "@/components/views/AdminDashboard" // 既存 AdminDashboard をラップ
import { initialProducts } from "@/components/data/products"
import { categories } from "@/components/data/categories"

// ---- 型（必要に応じて components/types/index.ts に切り出してOK） ----
export type CategoryId = "skincare" | "shampoo" | "treatment" | "styling"

export type Product = {
  id: string
  name: string
  price: number
  category: CategoryId
  image: string
  description: string
  ingredients: string
  fragrance: string
  tags: string[]
  rating: number
  stock: number
  isActive: boolean
  isNew?: boolean
  isPopular?: boolean
  isLimited?: boolean
}

export type TrialRequestStatus = "pending" | "completed" | "cancelled"
export type TrialRequest = {
  id: string
  products: Pick<Product, "id" | "name" | "price" | "image" | "rating">[]
  memo: string
  timestamp: string
  userId: string
  status: TrialRequestStatus
}

const ALL_CATEGORIES: CategoryId[] = ["skincare", "shampoo", "treatment", "styling"]
const collatorJa = new Intl.Collator("ja")
const fmtPrice = (n: number) => new Intl.NumberFormat("ja-JP").format(n)

export default function Page() {
  // ==== 画面切替 ====
  const [currentView, setCurrentView] = useState<"customer" | "staff" | "admin">("customer")

  // ==== 商品・選択 ====
  const [products, setProducts] = useState<Product[]>(initialProducts as Product[])
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // ==== カート / メモ ====
  const [trialCart, setTrialCart] = useState<Product[]>([])
  const [memo, setMemo] = useState("")

  // ==== 検索 / ソート / UI ====
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating">("name")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ==== リクエスト ====
  const [trialRequests, setTrialRequests] = useState<TrialRequest[]>([
    {
      id: "demo_1",
      products: [
        {
          id: "1",
          name: "ラグジュアリー セラム",
          price: 12800,
          image: initialProducts[0].image,
          rating: 4.9,
        },
      ],
      memo: "乾燥肌なので保湿力の高いものを希望します",
      timestamp: "2024/01/18 14:30",
      userId: "demo_user_001",
      status: "pending",
    },
  ])

  // 疑似ローディング
  useEffect(() => {
    if (!selectedCategory) return
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(t)
  }, [selectedCategory])

  // 商品フィルタ + ソート
  const filteredAndSortedProducts = useMemo(() => {
    const q = searchQuery.trim()
    const list = products.filter((p) => {
      const inCat = selectedCategory ? p.category === selectedCategory : true
      if (!q) return inCat
      return (
        (p.name.includes(q) ||
          p.description?.includes(q) ||
          p.tags?.some((tag) => tag.includes(q)) ||
          p.name.toLowerCase().includes(q.toLowerCase())) &&
        inCat
      )
    })
    const arr = [...list]
    switch (sortBy) {
      case "price":
        return arr.sort((a, b) => b.price - a.price)
      case "rating":
        return arr.sort((a, b) => b.rating - a.rating)
      default:
        return arr.sort((a, b) => collatorJa.compare(a.name, b.name))
    }
  }, [products, selectedCategory, searchQuery, sortBy])

  // ==== カート操作 ====
  const addToTrialCart = useCallback((product: Product) => {
    setTrialCart((prev) => (prev.some((i) => i.id === product.id) ? prev : [...prev, product]))
    // 追加後ホームへ戻す仕様（不要なら削除可）
    if (ALL_CATEGORIES.includes(product.category)) {
      setTimeout(() => {
        setSelectedProduct(null)
        setSelectedCategory(null)
      }, 500)
    }
  }, [])
  const removeFromTrialCart = (productId: string) =>
    setTrialCart((prev) => prev.filter((p) => p.id !== productId))

  // ==== リクエスト送信 / 処理 ====
  const sendTrialRequest = () => {
    if (trialCart.length === 0) {
      alert("商品を選択してください")
      return
    }
    const request: TrialRequest = {
      id: Date.now().toString(),
      products: trialCart.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        rating: p.rating,
      })),
      memo,
      timestamp: new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      userId: "customer_" + Math.random().toString(36).slice(2, 11),
      status: "pending",
    }
    setTrialRequests((prev) => [request, ...prev])
    setTrialCart([])
    setMemo("")
    alert("スタッフに通知いたしました！\n\nスタッフ画面（人型アイコン）で確認できます。")
  }

  const handleRequestAction = (requestId: string, action: "complete" | "cancel") => {
    setTrialRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: action === "complete" ? "completed" : "cancelled" } : r)),
    )
  }
  const deleteRequest = (requestId: string) => {
    if (confirm("このリクエストを削除しますか？")) {
      setTrialRequests((prev) => prev.filter((r) => r.id !== requestId))
    }
  }

  // ==== Admin 用：商品 CRUD ====
  const addProduct = (
    productData: Omit<Product, "id" | "rating" | "isNew" | "isPopular" | "isLimited" | "isActive">,
  ) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      rating: 0,
      isNew: false,
      isPopular: false,
      isLimited: false,
      isActive: true,
    }
    setProducts((prev) => [...prev, newProduct])
  }
  const updateProduct = (productData: Product) =>
    setProducts((prev) => prev.map((p) => (p.id === productData.id ? productData : p)))
  const deleteProduct = (productId: string) => {
    if (confirm("この商品を削除しますか？")) setProducts((prev) => prev.filter((p) => p.id !== productId))
  }
  const toggleProductStatus = (productId: string) =>
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p)))

  const pendingCount = trialRequests.filter((r) => r.status === "pending").length

  // ==== 画面描画 ====
  if (currentView === "staff") {
    return (
      <StaffDashboard
        trialRequests={trialRequests}
        onComplete={(id) => handleRequestAction(id, "complete")}
        onCancel={(id) => handleRequestAction(id, "cancel")}
        onDelete={deleteRequest}
        onBack={() => setCurrentView("customer")}
      />
    )
  }

  if (currentView === "admin") {
    return (
      <AdminView
        products={products}
        categories={categories}
        onAddProduct={addProduct}
        onUpdateProduct={updateProduct}
        onDeleteProduct={deleteProduct}
        onToggleStatus={toggleProductStatus}
        onBackToCustomer={() => setCurrentView("customer")}
      />
    )
  }

  return (
    <CustomerView
      // 状態
      products={filteredAndSortedProducts}
      categories={categories}
      selectedCategory={selectedCategory}
      selectedProduct={selectedProduct}
      trialCart={trialCart}
      memo={memo}
      searchQuery={searchQuery}
      sortBy={sortBy}
      showFilters={showFilters}
      isLoading={isLoading}
      // setter / action
      setSelectedCategory={setSelectedCategory}
      setSelectedProduct={setSelectedProduct}
      addToTrialCart={addToTrialCart}
      removeFromTrialCart={removeFromTrialCart}
      setMemo={setMemo}
      sendTrialRequest={sendTrialRequest}
      setSearchQuery={setSearchQuery}
      setSortBy={setSortBy}
      setShowFilters={setShowFilters}
      // ナビ
      goStaff={() => setCurrentView("staff")}
      goAdmin={() => setCurrentView("admin")}
      // util
      pendingCount={pendingCount}
      fmtPrice={fmtPrice}
    />
  )
}
