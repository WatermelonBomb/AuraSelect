'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, LogIn, AlertCircle } from 'lucide-react'
import Link from 'next/link'

import { LoginSchema, type Login } from '@/lib/schemas/auth'
import { useLogin } from '@/lib/hooks/useAuth'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const loginMutation = useLogin()

  const form = useForm<Login>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (data: Login) => {
    try {
      await loginMutation.mutateAsync(data)
      onSuccess?.()
    } catch (error) {
      // エラーハンドリングはuseLoginフック内で処理済み
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
          <LogIn className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">AuraSelect</CardTitle>
        <p className="text-gray-600">アカウントにログイン</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* エラー表示 */}
          {loginMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loginMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* メールアドレス/ユーザー名 */}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
              {...form.register('email')}
              disabled={loginMutation.isPending}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* パスワード */}
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="パスワードを入力"
                {...form.register('password')}
                disabled={loginMutation.isPending}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loginMutation.isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* パスワードを忘れた場合 */}
          <div className="text-right">
            <Link 
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              パスワードを忘れた場合
            </Link>
          </div>

          {/* ログインボタン */}
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ログイン中...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                ログイン
              </>
            )}
          </Button>

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>

          {/* アカウント作成 */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              アカウントをお持ちでないですか？{' '}
              <Link 
                href="/register"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                新規登録
              </Link>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// デモ用のクイックログインボタン（開発環境のみ）
export function QuickLoginDemo() {
  const loginMutation = useLogin()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleQuickLogin = (role: 'admin' | 'staff' | 'customer') => {
    const credentials = {
      admin: { email: 'admin@auraselect.com', password: 'admin123' },
      staff: { email: 'staff@auraselect.com', password: 'staff123' },
      customer: { email: 'customer@auraselect.com', password: 'customer123' },
    }

    loginMutation.mutateAsync(credentials[role])
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">
          開発用クイックログイン
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleQuickLogin('admin')}
            disabled={loginMutation.isPending}
          >
            管理者でログイン
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleQuickLogin('staff')}
            disabled={loginMutation.isPending}
          >
            スタッフでログイン
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleQuickLogin('customer')}
            disabled={loginMutation.isPending}
          >
            顧客でログイン
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}