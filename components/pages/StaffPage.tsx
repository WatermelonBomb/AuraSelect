"use client"

import { useAppStore } from '../../lib/store/appStore'
import { categories } from '@/components/data/categories'
import UnifiedDashboard from '@/components/views/UnifiedDashboard'

export default function StaffPage() {
  const {
    products,
    setCurrentView,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
  } = useAppStore()

  return (
    <UnifiedDashboard
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