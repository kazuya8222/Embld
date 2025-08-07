'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { Review } from '@/types'
import { cn } from '@/lib/utils/cn'
import { Star, Send, User } from 'lucide-react'

interface ReviewSectionProps {
  appId: string
  initialReviews: (Review & { user: { username: string; avatar_url?: string } })[]
}

export function ReviewSection({ appId, initialReviews }: ReviewSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || rating === 0) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          app_id: appId,
          user_id: user.id,
          rating,
          content: content.trim() || null,
        })
        .select(`
          *,
          user:users(username, avatar_url)
        `)
        .single()

      if (!error && data) {
        setReviews(prev => [data, ...prev])
        setRating(0)
        setContent('')
      }
    } catch (error) {
      console.error('Error posting review:', error)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-5 h-5 cursor-pointer transition-colors",
          i < (interactive ? (hoverRating || rating) : currentRating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        )}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      />
    ))
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const userHasReviewed = user ? reviews.some(review => review.user_id === user.id) : false

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          レビュー ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(averageRating)}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {user && !userHasReviewed ? (
        <form onSubmit={handleSubmitReview} className="space-y-4 bg-gray-50 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              評価 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {renderStars(rating, true)}
            </div>
          </div>

          <div>
            <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-2">
              コメント（任意）
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="アプリの感想を書いてください..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || rating === 0}
              className={cn(
                "bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2",
                (loading || rating === 0) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
              {loading ? 'レビュー中...' : 'レビューを投稿'}
            </button>
          </div>
        </form>
      ) : user && userHasReviewed ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
          <p className="text-green-700">
            既にこのアプリをレビューしています。ありがとうございます！
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
          <p className="text-gray-600 mb-3">レビューするにはログインが必要です</p>
          <a
            href="/auth/login"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            ログイン
          </a>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            まだレビューがありません。最初のレビューを投稿してみませんか？
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {review.user.avatar_url ? (
                    <img
                      src={review.user.avatar_url}
                      alt={review.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {review.user.username}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                  
                  {review.content && (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {review.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}