import { apiClient } from './client'
import type { User, UserRole } from '@/lib/schemas/auth'

export interface LoginRequest {
  username: string  // FastAPI-Users uses username for email
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: UserRole
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface AuthUser extends User {
  is_active: boolean
  is_superuser: boolean
  is_verified: boolean
}

// Auth API functions
export const authApi = {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const formData = new FormData()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)

      const response = await apiClient.post('/auth/jwt/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.access_token)
      }
      
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('ログインに失敗しました')
    }
  },

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthUser> {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('Registration failed:', error)
      throw new Error('ユーザー登録に失敗しました')
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await apiClient.get('/auth/users/me')
      return response.data
    } catch (error) {
      console.error('Failed to fetch current user:', error)
      throw new Error('ユーザー情報の取得に失敗しました')
    }
  },

  // Update user profile
  async updateUser(userData: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const response = await apiClient.patch('/auth/users/me', userData)
      return response.data
    } catch (error) {
      console.error('Failed to update user:', error)
      throw new Error('ユーザー情報の更新に失敗しました')
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/jwt/logout')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      // Always remove token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
    }
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email })
    } catch (error) {
      console.error('Password reset request failed:', error)
      throw new Error('パスワードリセットリクエストに失敗しました')
    }
  },

  // Reset password with token
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { token, password })
    } catch (error) {
      console.error('Password reset failed:', error)
      throw new Error('パスワードリセットに失敗しました')
    }
  }
}