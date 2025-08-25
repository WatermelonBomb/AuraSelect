"use client"
import { useState } from "react"
import BaseAdminDashboard from "@/components/AdminDashboard"

// 必要なら共通の型を import してください（例：Product/CategoryId）
// ここでは柔らかめに any にしていますが、手元の型があれば差し替えてOKです。
type Props = {
  products: any[]
  categories: any[]
  onAddProduct: (p: any) => void
  onUpdateProduct: (p: any) => void
  onDeleteProduct: (id: string) => void
  onToggleStatus: (id: string) => void
  onBackToCustomer: () => void
}

export default function AdminDashboardView({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus,
  onBackToCustomer,
}: Props) {
  // 既存 AdminDashboard が要求する追加の状態をここで内包
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)

  return (
    <BaseAdminDashboard
      products={products}
      categories={categories}
      onAddProduct={onAddProduct}
      onUpdateProduct={onUpdateProduct}
      onDeleteProduct={onDeleteProduct}
      onToggleStatus={onToggleStatus}
      editingProduct={editingProduct}
      setEditingProduct={setEditingProduct}
      showAddProduct={showAddProduct}
      setShowAddProduct={setShowAddProduct}
      onBackToCustomer={onBackToCustomer}
    />
  )
}
