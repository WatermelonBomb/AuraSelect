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
import { Eye, EyeOff, Loader2, UserPlus, AlertCircle, Mail, User, Lock, Phone } from 'lucide-react'
import Link from 'next/link'

import { RegisterSchema, type Register } from '@/lib/schemas/auth'
import { useRegister } from '../../lib/hooks/useAuth'

interface RegisterFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const registerMutation = useRegister()

  const form = useForm<Register>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      phone: '',
    },
  })

  const handleSubmit = async (data: Register) => {
    try {
      await registerMutation.mutateAsync(data)
      onSuccess?.()
    } catch (error) {
      // エラーハンドリングはuseRegisterフック内で処理済み
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">AuraSelect</CardTitle>
        <p className="text-gray-600">新規アカウント作成</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* エラー表示 */}
          {registerMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {registerMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* メールアドレス */}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                {...form.register('email')}
                disabled={registerMutation.isPending}
                className="pl-10"
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* ユーザー名 */}
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名（任意）</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="ユーザー名"
                {...form.register('username')}
                disabled={registerMutation.isPending}
                className="pl-10"
              />
            </div>
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          {/* 氏名 */}
          <div className="space-y-2">
            <Label htmlFor="full_name">お名前（任意）</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="山田太郎"
                {...form.register('full_name')}
                disabled={registerMutation.isPending}
                className="pl-10"
              />
            </div>
            {form.formState.errors.full_name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

          {/* 電話番号 */}
          <div className="space-y-2">
            <Label htmlFor="phone">電話番号（任意）</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="090-1234-5678"
                {...form.register('phone')}
                disabled={registerMutation.isPending}
                className="pl-10"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* パスワード */}
          <div className="space-y-2">
            <Label htmlFor="password">パスワード *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="6文字以上のパスワード"
                {...form.register('password')}
                disabled={registerMutation.isPending}
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={registerMutation.isPending}
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

          {/* パスワード確認 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード確認 *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="パスワードを再入力"
                {...form.register('confirmPassword')}
                disabled={registerMutation.isPending}
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={registerMutation.isPending}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* 利用規約・プライバシーポリシー */}
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            アカウントを作成することで、
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
              利用規約
            </Link>
            および
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </div>

          {/* 新規登録ボタン */}
          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                アカウント作成中...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                アカウント作成
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

          {/* ログインリンク */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <Link 
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                ログイン
              </Link>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}