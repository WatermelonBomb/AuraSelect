'use client'

import React from 'react'
import RegisterForm from '@/components/auth/RegisterForm'
import AuthGuard from '@/components/auth/AuthGuard'
import ClientOnly from '@/components/ClientOnly'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// SSR-safe fallback component
function RegisterPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600 text-center">読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <ClientOnly fallback={<RegisterPageFallback />}>
      <AuthGuard requireAuth={false}>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>
      </AuthGuard>
    </ClientOnly>
  )
}