'use client'

import { useState, useTransition, useRef } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Comment } from '@/types'
import { cn } from '@/lib/utils/cn'
import { MessageCircle, Send, User, Heart } from 'lucide-react'
import { addCommentForm } from '@/app/actions/comment'
import { postCommentViaEdge } from '@/lib/supabase/edge-functions'


interface CommentSectionProps {
  ideaId: string
  initialComments: (Comment & { user: { username: string; avatar_url?: string } })[]
}

export function CommentSection({ ideaId, initialComments }: CommentSectionProps) {
  const { user, userProfile } = useAuth()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const content = newComment.trim()
    if (!content || !user) return

    // 即座にコメントを表示（TikTok風）
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      idea_id: ideaId,
      user_id: user.id,
      content,
      created_at: new Date().toISOString(),
      user: {
        username: userProfile?.username || user.email?.split('@')[0] || 'You',
        avatar_url: userProfile?.avatar_url || userProfile?.google_avatar_url,
      },
      isOptimistic: true, // 投稿中フラグ
    } as Comment & { user: { username: string; avatar_url?: string }; isOptimistic?: boolean }

    setComments(prev => [optimisticComment, ...prev])
    setNewComment('')
    
    // フォーカスを維持してスムーズな連続投稿を可能に
    inputRef.current?.focus()

    // Edge Functionで高速投稿（CDN経由）
    startTransition(() => {
      postCommentViaEdge(ideaId, content).catch(error => {
        console.error('Error posting comment:', error)
        // エラー時のみ該当コメントを削除
        setComments(prev => prev.filter(c => c.id !== optimisticComment.id))
      })
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-gray-700" />
        <h3 className="text-lg font-bold text-gray-900">
          {comments.length} コメント
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {userProfile?.avatar_url || userProfile?.google_avatar_url ? (
                <img
                  src={userProfile.avatar_url || userProfile.google_avatar_url}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを追加..."
                rows={1}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200",
                  newComment.trim()
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl scale-100"
                    : "bg-gray-200 text-gray-400 scale-90"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-gray-600 flex-1">コメントするにはログインしてください</span>
          <a
            href="/auth/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            ログイン
          </a>
        </div>
      )}

      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>まだコメントがありません</p>
            <p className="text-sm">最初のコメントを投稿してみませんか？</p>
          </div>
        ) : (
          comments.map((comment, index) => {
            const isOptimistic = comment.id.startsWith('temp-')
            return (
              <div 
                key={comment.id} 
                className={cn(
                  "flex gap-3 transition-all duration-300",
                  isOptimistic && "animate-in slide-in-from-bottom-2 opacity-80"
                )}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {comment.user.avatar_url ? (
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2 relative">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {comment.user.username}
                      </span>
                      {isOptimistic && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{formatDate(comment.created_at)}</span>
                    <button className="hover:text-gray-700 transition-colors flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      いいね
                    </button>
                    <button className="hover:text-gray-700 transition-colors">
                      返信
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

