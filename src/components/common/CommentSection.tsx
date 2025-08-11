'use client'

import { useState, useTransition, useRef } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Comment } from '@/types'
import { cn } from '@/lib/utils/cn'
import { MessageCircle, Send, User, Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { addComment, addReply, toggleCommentLike, deleteComment } from '@/app/actions/comment'


interface CommentSectionProps {
  ideaId: string
  initialComments: (Comment & { user: { username: string; avatar_url?: string }; user_has_liked?: boolean })[]
}

export function CommentSection({ ideaId, initialComments }: CommentSectionProps) {
  const { user, userProfile } = useAuth()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [likedComments, setLikedComments] = useState<Set<string>>(
    new Set(initialComments.filter(c => c.user_has_liked).map(c => c.id))
  )
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set())
  const [enterCount, setEnterCount] = useState(0)
  const [replyEnterCount, setReplyEnterCount] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const content = newComment.trim()
    if (!content || !user) return

    // 即座にコメントを表示（Instagram風）
    const tempId = `temp-${Date.now()}`
    const userInfo = {
      username: userProfile?.username || user?.email?.split('@')[0] || 'Guest',
      avatar_url: userProfile?.avatar_url || userProfile?.google_avatar_url,
    }
    
    const optimisticComment = {
      id: tempId,
      idea_id: ideaId,
      user_id: user.id,
      content,
      created_at: new Date().toISOString(),
      user: userInfo,
      isOptimistic: true,
    } as Comment & { user: { username: string; avatar_url?: string }; isOptimistic?: boolean }

    // UIを即座に更新（新しいコメントを最上位に追加）
    setComments(prev => [optimisticComment, ...prev])
    
    // 入力欄をクリアして再フォーカス
    setNewComment('')
    setEnterCount(0)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    // バックグラウンドでサーバー更新（WantButtonと同じパターン）
    startTransition(() => {
      addComment(ideaId, content)
        .then(savedComment => {
          // 成功時は「送信中」を消すだけ
          setComments(prev => prev.map(c => 
            c.id === tempId ? { ...savedComment, isOptimistic: false } : c
          ))
        })
        .catch(error => {
          console.error('Comment error:', error)
          // エラー時のみ削除
          setComments(prev => prev.filter(c => c.id !== tempId))
        })
    })
  }

  // いいね機能のハンドラー（WantButtonと同じパターン）
  const handleLike = (commentId: string) => {
    if (!user) return
    
    const isCurrentlyLiked = likedComments.has(commentId)
    
    // UI即座更新
    setLikedComments(prev => {
      const newSet = new Set(prev)
      if (isCurrentlyLiked) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })

    // コメントのいいね数も更新
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes_count: comment.likes_count + (isCurrentlyLiked ? -1 : 1) }
        : comment
    ))

    // バックグラウンド更新
    startTransition(() => {
      toggleCommentLike(commentId).catch(error => {
        console.error('Like error:', error)
        // エラー時はUIを元に戻す
        setLikedComments(prev => {
          const newSet = new Set(prev)
          if (isCurrentlyLiked) {
            newSet.add(commentId)
          } else {
            newSet.delete(commentId)
          }
          return newSet
        })
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes_count: comment.likes_count + (isCurrentlyLiked ? 1 : -1) }
            : comment
        ))
      })
    })
  }

  // 返信機能のハンドラー
  const handleReply = (commentId: string) => {
    setReplyTo(commentId)
    setTimeout(() => {
      replyInputRef.current?.focus()
    }, 100)
  }

  const handleReplySubmit = (parentId: string) => {
    const content = replyContent.trim()
    if (!content || !user) return

    // 即座に返信を表示
    const tempId = `temp-reply-${Date.now()}`
    const userInfo = {
      username: userProfile?.username || user?.email?.split('@')[0] || 'Guest',
      avatar_url: userProfile?.avatar_url || userProfile?.google_avatar_url,
    }
    
    const optimisticReply = {
      id: tempId,
      idea_id: ideaId,
      user_id: user.id,
      content,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      user: userInfo,
      isOptimistic: true,
    } as Comment & { user: { username: string; avatar_url?: string }; isOptimistic?: boolean }

    setComments(prev => [optimisticReply, ...prev])
    setReplyContent('')
    setReplyTo(null)
    setReplyEnterCount(0)
    
    // 返信したコメントの返信を表示状態にする
    setShowReplies(prev => {
      const newSet = new Set(prev)
      newSet.add(parentId)
      return newSet
    })

    // バックグラウンド更新
    startTransition(() => {
      addReply(parentId, ideaId, content)
        .then(savedReply => {
          setComments(prev => prev.map(c => 
            c.id === tempId ? { ...savedReply, isOptimistic: false } : c
          ))
        })
        .catch(error => {
          console.error('Reply error:', error)
          setComments(prev => prev.filter(c => c.id !== tempId))
        })
    })
  }

  // 返信表示の切り替え
  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  // コメント削除機能
  const handleDeleteComment = (commentId: string) => {
    if (!user) return
    
    // 確認ダイアログ
    if (!confirm('このコメントを削除しますか？')) {
      return
    }
    
    // 即座にUIから削除
    setComments(prev => prev.filter(c => c.id !== commentId))
    
    // バックグラウンドで削除
    startTransition(() => {
      deleteComment(commentId).catch(error => {
        console.error('Delete comment error:', error)
        // エラー時は元に戻すため、ページリロードを促す
        alert('コメントの削除に失敗しました。ページを再読み込みしてください。')
        window.location.reload()
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
              {(userProfile?.avatar_url || userProfile?.google_avatar_url) ? (
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
                rows={2}
                className="w-full max-w-2xl px-4 py-3 bg-gray-50 border-0 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-100 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    if (enterCount === 0) {
                      // 1回目のEnterは確定（何もしない）
                      setEnterCount(1)
                    } else if (enterCount === 1) {
                      // 2回目のEnterで送信
                      e.preventDefault()
                      if (newComment.trim()) {
                        handleSubmit(e)
                      }
                    }
                  } else {
                    // 他のキーが押されたらEnterカウントをリセット
                    setEnterCount(0)
                  }
                }}
                autoComplete="off"
                spellCheck={false}
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
          comments
            .filter(comment => !comment.parent_id) // 親コメントのみ表示
            .map((comment) => {
              const replies = comments.filter(reply => reply.parent_id === comment.id)
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
                        <span className="text-xs text-blue-500 animate-pulse">送信中</span>
                      )}
                      {/* 削除ボタン（自分のコメントの場合のみ） */}
                      {user && comment.user_id === user.id && !isOptimistic && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="コメントを削除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{formatDate(comment.created_at)}</span>
                    <button 
                      onClick={() => handleLike(comment.id)}
                      className={cn(
                        "hover:text-red-500 transition-colors flex items-center gap-1",
                        likedComments.has(comment.id) && "text-red-500"
                      )}
                    >
                      <Heart className={cn(
                        "w-3 h-3", 
                        likedComments.has(comment.id) && "fill-current"
                      )} />
                      {comment.likes_count > 0 ? comment.likes_count : 'いいね'}
                    </button>
                    <button 
                      onClick={() => handleReply(comment.id)}
                      className="hover:text-blue-500 transition-colors"
                    >
                      返信
                    </button>
                    {replies.length > 0 && (
                      <button 
                        onClick={() => toggleReplies(comment.id)}
                        className="hover:text-blue-500 transition-colors text-blue-600 font-medium flex items-center gap-1"
                      >
                        {showReplies.has(comment.id) ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            返信を非表示
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            {replies.length}件の返信を表示
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* 返信入力欄 */}
                  {replyTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {(userProfile?.avatar_url || userProfile?.google_avatar_url) ? (
                          <img
                            src={userProfile.avatar_url || userProfile.google_avatar_url}
                            alt="Your avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <textarea
                          ref={replyInputRef}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`@${comment.user.username} に返信...`}
                          rows={1}
                          className="w-full px-3 py-2 bg-gray-50 border-0 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              if (replyEnterCount === 0) {
                                // 1回目のEnterは確定（何もしない）
                                setReplyEnterCount(1)
                              } else if (replyEnterCount === 1) {
                                // 2回目のEnterで送信
                                e.preventDefault()
                                if (replyContent.trim()) {
                                  handleReplySubmit(comment.id)
                                }
                              }
                            } else if (e.key === 'Escape') {
                              setReplyTo(null)
                              setReplyContent('')
                              setReplyEnterCount(0)
                            } else {
                              // 他のキーが押されたらEnterカウントをリセット
                              setReplyEnterCount(0)
                            }
                          }}
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            onClick={() => {
                              setReplyTo(null)
                              setReplyContent('')
                              setReplyEnterCount(0)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            ×
                          </button>
                          <button
                            onClick={() => handleReplySubmit(comment.id)}
                            disabled={!replyContent.trim()}
                            className={cn(
                              "p-1 rounded-full transition-all",
                              replyContent.trim()
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-gray-200 text-gray-400"
                            )}
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 返信プレビュー（折りたたみ時） */}
                  {replies.length > 0 && !showReplies.has(comment.id) && (
                    <div className="mt-2 ml-6 opacity-60">
                      <div className="flex gap-2 items-center">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {replies[0].user.avatar_url ? (
                            <img
                              src={replies[0].user.avatar_url}
                              alt={replies[0].user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                              <User className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{replies[0].user.username}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">
                          {replies[0].content}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* 返信表示 */}
                  {replies.length > 0 && showReplies.has(comment.id) && (
                    <div className="mt-3 space-y-2">
                      {replies.map((reply) => {
                        const isReplyOptimistic = reply.id.startsWith('temp-')
                        return (
                          <div key={reply.id} className={cn(
                            "flex gap-2 ml-6 transition-all duration-300",
                            isReplyOptimistic && "animate-in slide-in-from-bottom-2 opacity-80"
                          )}>
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {reply.user.avatar_url ? (
                                <img
                                  src={reply.user.avatar_url}
                                  alt={reply.user.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-100 rounded-xl px-3 py-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 text-xs">
                                    {reply.user.username}
                                  </span>
                                  {isReplyOptimistic && (
                                    <span className="text-xs text-blue-500 animate-pulse">送信中</span>
                                  )}
                                  {/* 削除ボタン（自分の返信の場合のみ） */}
                                  {user && reply.user_id === user.id && !isReplyOptimistic && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                                      title="返信を削除"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-gray-800 text-xs leading-relaxed">
                                  {reply.content}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span>{formatDate(reply.created_at)}</span>
                                <button 
                                  onClick={() => handleLike(reply.id)}
                                  className={cn(
                                    "hover:text-red-500 transition-colors flex items-center gap-1",
                                    likedComments.has(reply.id) && "text-red-500"
                                  )}
                                >
                                  <Heart className={cn(
                                    "w-3 h-3", 
                                    likedComments.has(reply.id) && "fill-current"
                                  )} />
                                  {reply.likes_count > 0 ? reply.likes_count : 'いいね'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

