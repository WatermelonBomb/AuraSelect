'use client'

import React from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

const ForgotPasswordSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

type ForgotPassword = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<ForgotPassword>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (data: ForgotPassword) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Mock API call - in real app, send reset email
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err) {
      setError('パスワードリセット処理中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-pink-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">メール送信完了</CardTitle>
            <p className="text-gray-600">パスワードリセットのご案内</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                入力されたメールアドレスにパスワードリセット用のリンクを送信しました。
                メールをご確認いただき、リンクをクリックしてパスワードを再設定してください。
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>• メールが届かない場合は、迷惑メールフォルダもご確認ください</p>
              <p>• リセットリンクの有効期限は24時間です</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ログイン画面に戻る
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-pink-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">パスワードを忘れた方</CardTitle>
          <p className="text-gray-600">登録済みのメールアドレスを入力してください</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  {...form.register('email')}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    リセット用メールを送信
                  </>
                )}
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ログイン画面に戻る
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}