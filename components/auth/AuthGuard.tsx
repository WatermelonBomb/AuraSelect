'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Lock } from 'lucide-react'

import { useAuth, usePermissions } from '../../lib/hooks/useAuth'
import type { UserRole } from '@/lib/schemas/auth'

interface AuthGuardProps {
  children: React.ReactNode
  // 認証が必要かどうか
  requireAuth?: boolean
  // 必要なロール（複数指定可能）
  requiredRoles?: UserRole[]
  // 必要な権限
  requiredPermissions?: string[]
  // 認証されていない場合のリダイレクト先
  loginRedirect?: string
  // 権限不足の場合のリダイレクト先
  unauthorizedRedirect?: string
  // カスタム認証チェック関数
  customCheck?: (user: any) => boolean
  // ローディング中の表示
  loadingComponent?: React.ReactNode
  // 権限不足時の表示
  unauthorizedComponent?: React.ReactNode
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  loginRedirect = '/login',
  unauthorizedRedirect,
  customCheck,
  loadingComponent,
  unauthorizedComponent,
}: AuthGuardProps) {
  const { user, isLoading, isLoggedIn } = useAuth()
  const permissions = usePermissions()
  const router = useRouter()
  const [isClient, setIsClient] = React.useState(false)
  
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // 計算された値（条件チェック）
  const hasRequiredRole = requiredRoles.length === 0 || (user && requiredRoles.includes(user.role))
  const hasAllPermissions = requiredPermissions.length === 0 || 
    (user && requiredPermissions.every(permission => {
      const permissionKey = `can${permission.charAt(0).toUpperCase() + permission.slice(1)}`
      return (permissions as any)[permissionKey] === true
    }))
  const passesCustomCheck = !customCheck || !user || customCheck(user)

  // すべてのuseEffectをコンポーネントの最上部で無条件に呼び出す
  useEffect(() => {
    if (requireAuth && !isLoggedIn && !isLoading) {
      router.push(loginRedirect)
    }
  }, [requireAuth, isLoggedIn, isLoading, router, loginRedirect])

  useEffect(() => {
    if (requiredRoles.length > 0 && user && !hasRequiredRole && unauthorizedRedirect) {
      router.push(unauthorizedRedirect)
    }
  }, [requiredRoles.length, user, hasRequiredRole, unauthorizedRedirect, router])

  useEffect(() => {
    if (requiredPermissions.length > 0 && user && !hasAllPermissions && unauthorizedRedirect) {
      router.push(unauthorizedRedirect)
    }
  }, [requiredPermissions.length, user, hasAllPermissions, unauthorizedRedirect, router])

  useEffect(() => {
    if (customCheck && user && !passesCustomCheck && unauthorizedRedirect) {
      router.push(unauthorizedRedirect)
    }
  }, [customCheck, user, passesCustomCheck, unauthorizedRedirect, router])

  // ローディング中またはクライアント側がまだ初期化されていない場合
  if (isLoading || !isClient) {
    return loadingComponent || <AuthLoadingComponent />
  }

  // 認証が必要なのにログインしていない場合
  if (requireAuth && !isLoggedIn) {
    return <AuthLoadingComponent message="ログイン画面に移動中..." />
  }

  // 認証が不要で、ユーザーがログインしていない場合は通す
  if (!requireAuth && !isLoggedIn) {
    return <>{children}</>
  }

  // ユーザーがログインしているがユーザー情報がない場合（エラー状態）
  if (isLoggedIn && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ユーザー情報の取得に失敗しました。再度ログインしてください。
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // ロールチェック
  if (requiredRoles.length > 0 && user && !hasRequiredRole) {
    if (unauthorizedRedirect) {
      return <AuthLoadingComponent message="ページを移動中..." />
    }
    return unauthorizedComponent || (
      <UnauthorizedComponent 
        message={`この機能を利用するには${requiredRoles.join('または')}の権限が必要です。`}
      />
    )
  }

  // 権限チェック
  if (requiredPermissions.length > 0 && user && !hasAllPermissions) {
    if (unauthorizedRedirect) {
      return <AuthLoadingComponent message="ページを移動中..." />
    }
    return unauthorizedComponent || (
      <UnauthorizedComponent 
        message="この機能を利用する権限がありません。"
      />
    )
  }

  // カスタムチェック
  if (customCheck && user && !passesCustomCheck) {
    if (unauthorizedRedirect) {
      return <AuthLoadingComponent message="ページを移動中..." />
    }
    return unauthorizedComponent || (
      <UnauthorizedComponent 
        message="この機能を利用する条件を満たしていません。"
      />
    )
  }

  // すべてのチェックを通過した場合、子コンポーネントを表示
  return <>{children}</>
}

// ローディングコンポーネント
function AuthLoadingComponent({ message = "認証情報を確認中..." }: { message?: string }) {
  const [isClient, setIsClient] = React.useState(false)
  
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600 text-center">
            {isClient ? message : "認証情報を確認中..."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// 権限不足コンポーネント
function UnauthorizedComponent({ message }: { message: string }) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            アクセス権限がありません
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-2 w-full">
            <button
              onClick={() => router.back()}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              戻る
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 便利なプリセットガード
export const AdminGuard = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard requiredRoles={['admin']}>
    {children}
  </AuthGuard>
)

export const StaffGuard = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard requiredRoles={['admin', 'manager', 'stylist']}>
    {children}
  </AuthGuard>
)

export const CustomerGuard = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard requiredRoles={['customer']}>
    {children}
  </AuthGuard>
)

export const ManagerGuard = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard requiredRoles={['admin', 'manager']}>
    {children}
  </AuthGuard>
)

// 権限ベースのガード
export const ProductManagementGuard = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard requiredPermissions={['manageProducts']}>
    {children}
  </AuthGuard>
)

export const TrialManagementGuard = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard requiredPermissions={['manageTrials']}>
    {children}
  </AuthGuard>
)