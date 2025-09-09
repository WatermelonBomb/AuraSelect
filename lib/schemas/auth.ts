import { z } from 'zod'

export type UserRole = 'admin' | 'manager' | 'stylist' | 'customer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
}

export interface Permissions {
  canManageProducts: boolean
  canManageTrials: boolean
  canManageUsers: boolean
  canViewReports: boolean
  canManageBookings: boolean
}

// Login schema
export const LoginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
})

export type Login = z.infer<typeof LoginSchema>

// Register schema
export const RegisterSchema = z.object({
  name: z.string().min(2, '名前は2文字以上である必要があります'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

export type Register = z.infer<typeof RegisterSchema>