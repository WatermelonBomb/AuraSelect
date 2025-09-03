"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/hooks/useAuth'
import { useAppStore } from '../lib/store/appStore'
import AuthGuard from '@/components/auth/AuthGuard'
import CustomerPage from '@/components/pages/CustomerPage'
import StaffPage from '@/components/pages/StaffPage'
import AdminPage from '@/components/pages/AdminPage'

function Page() {
  const { user, isLoading, isLoggedIn } = useAuth()
  const router = useRouter()
  const { currentView, setCurrentView } = useAppStore()

  // 認証されていない場合はログインページにリダイレクト
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login')
    }
  }, [isLoading, isLoggedIn, router])

  // ユーザーのロールに基づいて初期ビューを設定
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setCurrentView('admin')
      } else if (['manager', 'stylist'].includes(user.role)) {
        setCurrentView('staff')
      } else {
        setCurrentView('customer')
      }
    }
  }, [user, setCurrentView])

  // ビューに応じて適切なページコンポーネントを表示
  switch (currentView) {
    case "staff":
      return <StaffPage />
    case "admin":
      return <AdminPage />
    default:
      return <CustomerPage />
  }
}

// ページ全体をAuthGuardでラップ
function AuthenticatedPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Page />
    </AuthGuard>
  )
}

export { AuthenticatedPage as default }