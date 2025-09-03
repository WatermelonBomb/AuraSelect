"use client"

import { useMemo, useEffect } from 'react'
import { useAppStore } from '../../lib/store/appStore'
import { categories } from '@/components/data/categories'
import CustomerView from '@/components/views/CustomerViewEnhanced'
import { collatorJa, fmtPrice } from '../../lib/utils/index'
import { useProducts } from '../../lib/hooks/useProducts'

export default function CustomerPage() {
  // Fetch products from API
  const { data: productsData, isLoading: isProductsLoading } = useProducts()
  
  const {
    // 商品・フィルタ関連
    products: storeProducts,
    setProducts,
    selectedCategory,
    selectedProduct,
    searchQuery,
    sortBy,
    showFilters,
    isTrialLoading,
    setSelectedCategory,
    setSelectedProduct,
    setSearchQuery,
    setSortBy,
    setShowFilters,
    setIsTrialLoading,
    
    // カート関連
    trialCart,
    memo,
    addToTrialCart,
    removeFromTrialCart,
    clearTrialCart,
    setMemo,
    sendTrialRequest,
    
    // ナビゲーション
    setCurrentView,
    
    // リクエスト
    trialRequests,
  } = useAppStore()

  // Update store with API data when it loads
  useEffect(() => {
    if (productsData?.items) {
      // Convert API products to frontend format
      const convertedProducts = productsData.items.map(product => ({
        id: product.id.toString(), // Convert to string for frontend compatibility
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        category: product.category.toLowerCase() as any,
        description: product.description || '',
        ingredients: '',
        fragrance: '',
        tags: [],
        stock: product.stock_quantity,
        image: product.image_urls?.[0] || 'https://images.unsplash.com/photo-1702471896938-6ca42213ab1c?q=80&w=1335&auto=format&fit=crop',
        rating: 4.5,
        isActive: product.status === 'ACTIVE',
        isNew: product.is_featured,
        isPopular: false,
        isLimited: false,
      }))
      setProducts(convertedProducts)
    }
  }, [productsData, setProducts])

  const products = storeProducts

  // 疑似ローディング
  useEffect(() => {
    if (!selectedCategory) return
    setIsTrialLoading(true)
    const timer = setTimeout(() => setIsTrialLoading(false), 500)
    return () => clearTimeout(timer)
  }, [selectedCategory, setIsTrialLoading])

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

  const pendingCount = trialRequests.filter((r) => r.status === "pending").length

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
      isLoading={isTrialLoading || isProductsLoading}
      // setter / action
      setSelectedCategory={setSelectedCategory}
      setSelectedProduct={setSelectedProduct}
      addToTrialCart={addToTrialCart}
      removeFromTrialCart={removeFromTrialCart}
      setMemo={setMemo}
      clearTrialCart={clearTrialCart}
      setSearchQuery={setSearchQuery}
      setSortBy={setSortBy}
      setShowFilters={setShowFilters}
      // ナビ - 統合ダッシュボードへの遷移
      goDashboard={() => setCurrentView("staff")}
      // util
      pendingCount={pendingCount}
      fmtPrice={fmtPrice}
    />
  )
}