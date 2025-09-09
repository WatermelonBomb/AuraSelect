import { apiClient } from './client'
import type { Product } from '@/components/views/AdminDashboard'

export interface ProductFilters {
  category?: string
  search?: string
  is_active?: boolean
  skip?: number
  limit?: number
  sort_by?: 'name' | 'price' | 'rating' | 'created_at'
}

export interface CreateProductData {
  name: string
  price: number
  category: string
  description: string
  ingredients: string
  fragrance: string
  tags: string[]
  stock: number
  image?: string
}

export interface UpdateProductData extends Partial<CreateProductData> {
  is_active?: boolean
}

// Product API functions
export const productsApi = {
  // Get all products with optional filters
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active))
      if (filters?.skip) params.append('skip', String(filters.skip))
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.sort_by) params.append('sort_by', filters.sort_by)

      const response = await apiClient.get(`/products?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch products:', error)
      throw new Error('商品の取得に失敗しました')
    }
  },

  // Get single product by ID
  async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiClient.get(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch product:', error)
      throw new Error('商品の取得に失敗しました')
    }
  },

  // Create new product (admin only)
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const response = await apiClient.post('/products', data)
      return response.data
    } catch (error) {
      console.error('Failed to create product:', error)
      throw new Error('商品の作成に失敗しました')
    }
  },

  // Update product (admin only)
  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    try {
      const response = await apiClient.put(`/products/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Failed to update product:', error)
      throw new Error('商品の更新に失敗しました')
    }
  },

  // Delete product (admin only)
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`/products/${id}`)
    } catch (error) {
      console.error('Failed to delete product:', error)
      throw new Error('商品の削除に失敗しました')
    }
  },

  // Toggle product active status
  async toggleProductStatus(id: string): Promise<Product> {
    try {
      const response = await apiClient.patch(`/products/${id}/toggle-status`)
      return response.data
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      throw new Error('商品ステータスの更新に失敗しました')
    }
  }
}