'use client'

import { useState, useEffect } from 'react'
import { reviewsApi, type Review, type CreateReviewData, type ReviewFilters, type ReviewStats } from '@/lib/api/reviews'

// Mock review data for development fallback
const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user-1',
    productId: '1',
    rating: 5,
    title: '素晴らしい商品です',
    comment: 'とても良い商品でした。肌がとてもしっとりして満足しています。',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    user: {
      name: '田中さん',
    }
  },
  {
    id: '2',
    userId: 'user-2',
    productId: '1',
    rating: 4,
    title: 'コスパ良し',
    comment: '価格の割には品質が良くて気に入っています。リピートしたいです。',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    user: {
      name: '佐藤さん',
    }
  }
]

export function useReviews(filters?: ReviewFilters) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try API first, fallback to mock data
      const data = await reviewsApi.getReviews(filters)
      setReviews(data)
    } catch (err) {
      console.warn('API review fetch failed, using fallback:', err)
      // Fallback to mock data for development
      let filteredReviews = mockReviews
      
      if (filters?.productId) {
        filteredReviews = filteredReviews.filter(r => r.productId === filters.productId)
      }
      if (filters?.rating) {
        filteredReviews = filteredReviews.filter(r => r.rating === filters.rating)
      }
      
      setReviews(filteredReviews)
      setError(null) // Don't show error for development fallback
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const refetch = () => {
    return fetchReviews()
  }

  return {
    reviews,
    isLoading,
    error,
    refetch
  }
}

export function useProductReviews(productId: string, limit?: number) {
  return useReviews({ productId, limit })
}

export function useCreateReview() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createReview = async (data: CreateReviewData): Promise<Review> => {
    setIsLoading(true)
    setError(null)

    try {
      // Try API first
      const newReview = await reviewsApi.createReview(data)
      return newReview
    } catch (err) {
      console.warn('API review creation failed, using fallback:', err)
      
      // Fallback to mock data for development
      const newReview: Review = {
        id: Date.now().toString(),
        userId: 'current-user',
        productId: data.productId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          name: 'あなた'
        }
      }
      
      mockReviews.push(newReview)
      return newReview
    } finally {
      setIsLoading(false)
    }
  }

  // React Query compatibility
  const mutateAsync = createReview

  return {
    createReview,
    mutateAsync,
    isLoading,
    error
  }
}

export function useReviewStats(productId: string) {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try API first
      const data = await reviewsApi.getProductReviewStats(productId)
      setStats(data)
    } catch (err) {
      console.warn('API review stats failed, using fallback:', err)
      
      // Fallback to calculated stats from mock data
      const productReviews = mockReviews.filter(r => r.productId === productId)
      const totalReviews = productReviews.length
      const averageRating = totalReviews > 0 
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0

      const ratingDistribution = {
        1: productReviews.filter(r => r.rating === 1).length,
        2: productReviews.filter(r => r.rating === 2).length,
        3: productReviews.filter(r => r.rating === 3).length,
        4: productReviews.filter(r => r.rating === 4).length,
        5: productReviews.filter(r => r.rating === 5).length,
      }

      setStats({
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: ratingDistribution
      })
      
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchStats()
    }
  }, [productId])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  }
}

export function useUserReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserReviews = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try API first
      const data = await reviewsApi.getUserReviews()
      setReviews(data)
    } catch (err) {
      console.warn('API user reviews failed, using fallback:', err)
      
      // Fallback to mock data for development
      const userReviews = mockReviews.filter(r => r.userId === 'current-user')
      setReviews(userReviews)
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserReviews()
  }, [])

  return {
    reviews,
    isLoading,
    error,
    refetch: fetchUserReviews
  }
}