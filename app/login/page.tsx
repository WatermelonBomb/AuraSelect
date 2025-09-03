'use client'

import React from 'react'
import LoginForm, { QuickLoginDemo } from '@/components/auth/LoginForm'
import AuthGuard from '@/components/auth/AuthGuard'

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <LoginForm />
          <QuickLoginDemo />
        </div>
      </div>
    </AuthGuard>
  )
}