'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Send, User, Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { createOwnerPostComment, deleteOwnerPostComment } from '@/app/actions/ownerComments'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id?: string
  user: {
    username: string
    avatar_url?: string
  }
}

interface OwnerCommentSectionProps {
  postId: string
  initialComments: Comment[]
  currentUser: any
  userProfile: any
}

export function OwnerCommentSection({ postId, initialComments, currentUser, userProfile }: OwnerCommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set())
  const [enterCount, setEnterCount] = useState(0)
  const [replyEnterCount, setReplyEnterCount] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = newComment.trim()
    if (!content || !currentUser) return

    // 即座にコメントを表示
    const tempId = `temp-${Date.now()}`
    const userInfo = {
      username: userProfile?.username || currentUser?.email?.split('@')[0] || 'Guest',
      avatar_url: userProfile?.avatar_url || userProfile?.google_avatar_url,
    }
    
    const optimisticComment = {
      id: tempId,
      post_id: postId,
      user_id: currentUser.id,
      content,
      created_at: new Date().toISOString(),
      user: userInfo,
      isOptimistic: true,
    } as Comment & { isOptimistic?: boolean }

    // UIを即座に更新
    setComments(prev => [optimisticComment, ...prev])
    
    // 入力欄をクリア
    setNewComment('')
    setEnterCount(0)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)

    // バックグラウンドでサーバー更新
    startTransition(async () => {
      try {
        const result = await createOwnerPostComment({
          post_id: postId,
          user_id: currentUser.id,
          content
        })
        
        if (result.success) {
          // 成功時は一時的なコメントを更新
          setComments(prev => prev.map(c => 
            c.id === tempId ? { ...result.data, user: userInfo, isOptimistic: false } : c
          ))
          router.refresh()
        } else {
          // エラー時は削除
          setComments(prev => prev.filter(c => c.id !== tempId))
        }
      } catch (error) {
        console.error('Comment error:', error)
        setComments(prev => prev.filter(c => c.id !== tempId))
      }
    })
  }

  // 返信機能のハンドラー
  const handleReply = (commentId: string) => {
    setReplyTo(commentId)
    setTimeout(() => {
      replyInputRef.current?.focus()
    }, 100)
  }

  const handleReplySubmit = async (parentId: string) => {
    const content = replyContent.trim()
    if (!content || !currentUser) return

    // 即座に返信を表示
    const tempId = `temp-reply-${Date.now()}`
    const userInfo = {
      username: userProfile?.username || currentUser?.email?.split('@')[0] || 'Guest',
      avatar_url: userProfile?.avatar_url || userProfile?.google_avatar_url,
    }
    
    const optimisticReply = {
      id: tempId,
      post_id: postId,
      user_id: currentUser.id,
      content,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      user: userInfo,
      isOptimistic: true,
    } as Comment & { isOptimistic?: boolean }

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
    startTransition(async () => {
      try {
        const result = await createOwnerPostComment({
          post_id: postId,
          user_id: currentUser.id,
          content,
          parent_id: parentId
        })
        
        if (result.success) {
          setComments(prev => prev.map(c => 
            c.id === tempId ? { ...result.data, user: userInfo, isOptimistic: false } : c
          ))
          router.refresh()
        } else {
          setComments(prev => prev.filter(c => c.id !== tempId))
        }
      } catch (error) {
        console.error('Reply error:', error)
        setComments(prev => prev.filter(c => c.id !== tempId))
      }
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
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return
    
    // 確認ダイアログ
    if (!confirm('このコメントを削除しますか？')) {
      return
    }
    
    // 即座にUIから削除
    setComments(prev => prev.filter(c => c.id !== commentId))
    
    // バックグラウンドで削除
    startTransition(async () => {
      try {
        const result = await deleteOwnerPostComment(commentId)
        if (result.success) {
          router.refresh()
        } else {
          // エラー時は元に戻すため、ページリロードを促す
          alert('コメントの削除に失敗しました。ページを再読み込みしてください。')
          window.location.reload()
        }
      } catch (error) {
        console.error('Delete comment error:', error)
        alert('コメントの削除に失敗しました。ページを再読み込みしてください。')
        window.location.reload()
      }
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

      {currentUser ? (
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
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
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
                className="w-full max-w-2xl px-4 py-3 bg-gray-50 border-0 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-100 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    if (enterCount === 0) {
                      setEnterCount(1)
                    } else if (enterCount === 1) {
                      e.preventDefault()
                      if (newComment.trim()) {
                        handleSubmit(e)
                      }
                    }
                  } else {
                    setEnterCount(0)
                  }
                }}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                  newComment.trim()
                    ? "bg-purple-500 text-white hover:bg-purple-600 shadow-lg hover:shadow-xl scale-100"
                    : "bg-gray-200 text-gray-400 scale-90"
                }`}
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
            className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition-colors text-sm font-medium"
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
                  className={`flex gap-3 transition-all duration-300 ${
                    isOptimistic ? "animate-in slide-in-from-bottom-2 opacity-80" : ""
                  }`}
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
                          <span className="text-xs text-purple-500 animate-pulse">送信中</span>
                        )}
                        {/* 削除ボタン（自分のコメントの場合のみ） */}
                        {currentUser && comment.user_id === currentUser.id && !isOptimistic && (
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
                        onClick={() => handleReply(comment.id)}
                        className="hover:text-purple-500 transition-colors"
                      >
                        返信
                      </button>
                      {replies.length > 0 && (
                        <button 
                          onClick={() => toggleReplies(comment.id)}
                          className="hover:text-purple-500 transition-colors text-purple-600 font-medium flex items-center gap-1"
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
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
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
                            className="w-full px-3 py-2 bg-gray-50 border-0 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                if (replyEnterCount === 0) {
                                  setReplyEnterCount(1)
                                } else if (replyEnterCount === 1) {
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
                              className={`p-1 rounded-full transition-all ${
                                replyContent.trim()
                                  ? "bg-purple-500 text-white hover:bg-purple-600"
                                  : "bg-gray-200 text-gray-400"
                              }`}
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
                            <div key={reply.id} className={`flex gap-2 ml-6 transition-all duration-300 ${
                              isReplyOptimistic ? "animate-in slide-in-from-bottom-2 opacity-80" : ""
                            }`}>
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
                                      <span className="text-xs text-purple-500 animate-pulse">送信中</span>
                                    )}
                                    {/* 削除ボタン（自分の返信の場合のみ） */}
                                    {currentUser && reply.user_id === currentUser.id && !isReplyOptimistic && (
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