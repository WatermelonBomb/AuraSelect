import { apiClient } from './client'

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  title?: string
  comment: string
  createdAt: Date
  updatedAt: Date
  // User information for display
  user?: {
    name: string
    avatar?: string
  }
}

export interface CreateReviewData {
  productId: string
  rating: number
  title?: string
  comment: string
}

export interface UpdateReviewData {
  rating?: number
  title?: string
  comment?: string
}

export interface ReviewFilters {
  productId?: string
  userId?: string
  rating?: number
  skip?: number
  limit?: number
  sort_by?: 'created_at' | 'rating' | 'helpful'
}

export interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

// Review API functions
export const reviewsApi = {
  // Get reviews with optional filters
  async getReviews(filters?: ReviewFilters): Promise<Review[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.productId) params.append('product_id', filters.productId)
      if (filters?.userId) params.append('user_id', filters.userId)
      if (filters?.rating) params.append('rating', String(filters.rating))
      if (filters?.skip) params.append('skip', String(filters.skip))
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.sort_by) params.append('sort_by', filters.sort_by)

      const response = await apiClient.get(`/reviews?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      throw new Error('レビューの取得に失敗しました')
    }
  },

  // Get reviews for a specific product
  async getProductReviews(productId: string, limit?: number): Promise<Review[]> {
    return this.getReviews({ productId, limit })
  },

  // Get review statistics for a product
  async getProductReviewStats(productId: string): Promise<ReviewStats> {
    try {
      const response = await apiClient.get(`/reviews/stats/${productId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch review stats:', error)
      throw new Error('レビュー統計の取得に失敗しました')
    }
  },

  // Get single review by ID
  async getReview(id: string): Promise<Review> {
    try {
      const response = await apiClient.get(`/reviews/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch review:', error)
      throw new Error('レビューの取得に失敗しました')
    }
  },

  // Create new review
  async createReview(data: CreateReviewData): Promise<Review> {
    try {
      const response = await apiClient.post('/reviews', data)
      return response.data
    } catch (error) {
      console.error('Failed to create review:', error)
      throw new Error('レビューの投稿に失敗しました')
    }
  },

  // Update review
  async updateReview(id: string, data: UpdateReviewData): Promise<Review> {
    try {
      const response = await apiClient.put(`/reviews/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Failed to update review:', error)
      throw new Error('レビューの更新に失敗しました')
    }
  },

  // Delete review
  async deleteReview(id: string): Promise<void> {
    try {
      await apiClient.delete(`/reviews/${id}`)
    } catch (error) {
      console.error('Failed to delete review:', error)
      throw new Error('レビューの削除に失敗しました')
    }
  },

  // Get user's reviews
  async getUserReviews(): Promise<Review[]> {
    try {
      const response = await apiClient.get('/reviews/my')
      return response.data
    } catch (error) {
      console.error('Failed to fetch user reviews:', error)
      throw new Error('レビューの取得に失敗しました')
    }
  }
}