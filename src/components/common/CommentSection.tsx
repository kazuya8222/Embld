'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Comment } from '@/types'
import { cn } from '@/lib/utils/cn'
import { MessageCircle, Send, User } from 'lucide-react'


interface CommentSectionProps {
  ideaId: string
  initialComments: (Comment & { user: { username: string; avatar_url?: string } })[]
}

export function CommentSection({ ideaId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // セッション確認
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkSession()
  }, [])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setError(null)
    setLoading(true)
    
    try {
      // セッションを取得
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('ログインが必要です')
      }
      
      const userId = session.user.id

      const { data, error } = await supabase
        .from('comments')
        .insert({
          idea_id: ideaId,
          user_id: userId,
          content: newComment.trim(),
        })
        .select(`
          *,
          user:users(username, avatar_url)
        `)
        .single()

      if (error) throw error

      // コメントを追加
      setComments(prev => [data, ...prev])
      setNewComment('')
      
    } catch (error) {
      console.error('Error posting comment:', error)
      setError(error instanceof Error ? error.message : 'コメントの投稿に失敗しました')
    } finally {
      setLoading(false)
    }
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          コメント ({comments.length})
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを投稿してアイデアについて話し合いましょう..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className={cn(
                "bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2",
                (loading || !newComment.trim()) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
              {loading ? '投稿中...' : 'コメント'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
          <p className="text-gray-600 mb-3">コメントするにはログインが必要です</p>
          <a
            href="/auth/login"
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            ログイン
          </a>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            まだコメントがありません。最初のコメントを投稿してみませんか？
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {comment.user.avatar_url ? (
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {comment.user.username}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}