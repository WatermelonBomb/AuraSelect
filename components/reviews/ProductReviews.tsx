'use client'

import { useState } from 'react'
import { Star, ThumbsUp, MessageSquare, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProductReviews, useReviewStats, useCreateReview } from '@/lib/hooks/useReviews'
import { showSuccess, showApiError } from '@/lib/utils/toast'
import type { Review } from '@/lib/api/reviews'

interface ProductReviewsProps {
  productId: string
  productName?: string
  canWriteReview?: boolean
}

function StarRating({ rating, size = 'sm', editable = false, onChange }: {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  editable?: boolean
  onChange?: (rating: number) => void
}) {
  const starSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size]

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          } ${editable ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={editable ? () => onChange?.(star) : undefined}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="glass-effect border-0 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-800">{review.user?.name || '匿名'}</span>
              <Badge variant="secondary" className="text-xs">
                {new Date(review.createdAt).toLocaleDateString('ja-JP')}
              </Badge>
            </div>
            <StarRating rating={review.rating} size="sm" />
          </div>
        </div>
        
        {review.title && (
          <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
        )}
        
        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      </CardContent>
    </Card>
  )
}

function ReviewForm({ 
  productId, 
  onSuccess, 
  onCancel 
}: { 
  productId: string
  onSuccess: () => void
  onCancel: () => void 
}) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const createReviewMutation = useCreateReview()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!comment.trim()) {
      showApiError(new Error('コメントを入力してください'))
      return
    }

    try {
      await createReviewMutation.mutateAsync({
        productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim()
      })
      
      showSuccess('レビューを投稿しました！')
      onSuccess()
    } catch (error) {
      showApiError(error)
    }
  }

  return (
    <Card className="glass-effect border-0 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-playfair">レビューを書く</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-800">評価</Label>
            <div className="mt-2">
              <StarRating 
                rating={rating} 
                size="lg" 
                editable 
                onChange={setRating}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="title" className="text-sm font-semibold text-gray-800">
              タイトル（任意）
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="レビューのタイトル"
              className="mt-2 border-2 border-amber-200 focus:border-amber-400 rounded-xl"
            />
          </div>
          
          <div>
            <Label htmlFor="comment" className="text-sm font-semibold text-gray-800">
              コメント *
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="商品について詳しくお聞かせください"
              rows={4}
              className="mt-2 border-2 border-amber-200 focus:border-amber-400 rounded-xl"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="submit"
              disabled={createReviewMutation.isLoading}
              className="rose-gold-gradient text-white font-semibold px-6 py-2 rounded-xl"
            >
              {createReviewMutation.isLoading ? '投稿中...' : '投稿する'}
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-2 border-gray-300 px-6 py-2 rounded-xl"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ProductReviews({ 
  productId, 
  productName,
  canWriteReview = true 
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const { reviews, isLoading, refetch } = useProductReviews(productId, 20)
  const { stats } = useReviewStats(productId)

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    refetch()
  }

  if (isLoading) {
    return (
      <Card className="glass-effect border-0 rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && stats.total_reviews > 0 && (
        <Card className="glass-effect border-0 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold luxury-text-gradient">
                  {stats.average_rating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(stats.average_rating)} size="sm" />
                <div className="text-sm text-gray-600 mt-1">
                  {stats.total_reviews}件のレビュー
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${stats.total_reviews > 0 
                            ? (stats.rating_distribution[star as keyof typeof stats.rating_distribution] / stats.total_reviews) * 100 
                            : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {stats.rating_distribution[star as keyof typeof stats.rating_distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review Button */}
      {canWriteReview && !showReviewForm && (
        <Button
          onClick={() => setShowReviewForm(true)}
          className="w-full rose-gold-gradient text-white font-semibold py-3 rounded-2xl luxury-shadow"
        >
          <Plus className="w-5 h-5 mr-2" />
          レビューを書く
        </Button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-playfair font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          レビュー ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <Card className="glass-effect border-0 rounded-2xl">
            <CardContent className="p-8 text-center text-gray-600">
              まだレビューがありません。最初のレビューを投稿してみませんか？
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}