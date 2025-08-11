'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'

// ユーザーキャッシュ（wantPost.tsと同様）
let cachedUser: { id: string; timestamp: number } | null = null

export const addComment = async (ideaId: string, content: string) => {
  const supabase = createSupabaseServerClient()
  
  // キャッシュされたユーザー情報を使用
  let userId: string
  if (cachedUser && Date.now() - cachedUser.timestamp < 5000) {
    userId = cachedUser.id
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/auth/login')
    }
    cachedUser = { id: user.id, timestamp: Date.now() }
    userId = user.id
  }

  if (!content.trim()) {
    throw new Error('コメント内容を入力してください')
  }

  // 挿入とプロファイル取得を並列実行
  const [insertResult, profileResult] = await Promise.all([
    supabase
      .from('comments')
      .insert({
        idea_id: ideaId,
        user_id: userId,
        content: content.trim(),
      })
      .select()
      .single(),
    supabase
      .from('users')
      .select('username, avatar_url')
      .eq('id', userId)
      .single()
  ])

  if (insertResult.error) {
    console.error('Comment insert error:', insertResult.error)
    throw new Error(`コメントの投稿に失敗しました: ${insertResult.error.message}`)
  }

  // データを結合
  const data = {
    ...insertResult.data,
    user: profileResult.data
  }

  // キャッシュを無効化（タグベース）
  revalidateTag('ideas')
  revalidateTag(`idea-${ideaId}`)
  
  return data
}

// フォーム向けのサーバーアクション（Server Actions + useFormStatus対応）
export const addCommentForm = async (ideaId: string, formData: FormData) => {
  const content = (formData.get('content') as string) ?? ''
  return addComment(ideaId, content)
}

// コメントに返信を追加
export const addReply = async (parentCommentId: string, ideaId: string, content: string) => {
  const supabase = createSupabaseServerClient()
  
  let userId: string
  if (cachedUser && Date.now() - cachedUser.timestamp < 5000) {
    userId = cachedUser.id
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/auth/login')
    }
    cachedUser = { id: user.id, timestamp: Date.now() }
    userId = user.id
  }

  if (!content.trim()) {
    throw new Error('返信内容を入力してください')
  }

  const [insertResult, profileResult] = await Promise.all([
    supabase
      .from('comments')
      .insert({
        idea_id: ideaId,
        user_id: userId,
        content: content.trim(),
        parent_id: parentCommentId,
      })
      .select()
      .single(),
    supabase
      .from('users')
      .select('username, avatar_url')
      .eq('id', userId)
      .single()
  ])

  if (insertResult.error) {
    console.error('Reply insert error:', insertResult.error)
    throw new Error(`返信の投稿に失敗しました: ${insertResult.error.message}`)
  }

  const data = {
    ...insertResult.data,
    user: profileResult.data
  }

  revalidateTag('ideas')
  revalidateTag(`idea-${ideaId}`)
  
  return data
}

// コメントにいいねを切り替え
export const toggleCommentLike = async (commentId: string) => {
  const supabase = createSupabaseServerClient()
  
  let userId: string
  if (cachedUser && Date.now() - cachedUser.timestamp < 5000) {
    userId = cachedUser.id
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/auth/login')
    }
    cachedUser = { id: user.id, timestamp: Date.now() }
    userId = user.id
  }

  // 既存のいいねをチェック
  const { data: existingLike } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // いいねを削除
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`いいねの削除に失敗しました: ${error.message}`)
    }
    
    return { liked: false }
  } else {
    // いいねを追加
    const { error } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: userId,
      })

    if (error) {
      throw new Error(`いいねの追加に失敗しました: ${error.message}`)
    }
    
    return { liked: true }
  }
}

// コメントを削除
export const deleteComment = async (commentId: string) => {
  const supabase = createSupabaseServerClient()
  
  let userId: string
  if (cachedUser && Date.now() - cachedUser.timestamp < 5000) {
    userId = cachedUser.id
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/auth/login')
    }
    cachedUser = { id: user.id, timestamp: Date.now() }
    userId = user.id
  }

  // 自分のコメントかチェック
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (fetchError) {
    throw new Error(`コメントが見つかりませんでした: ${fetchError.message}`)
  }

  if (comment.user_id !== userId) {
    throw new Error('自分のコメントのみ削除できます')
  }

  // コメント削除
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId) // 追加のセキュリティチェック

  if (error) {
    throw new Error(`コメントの削除に失敗しました: ${error.message}`)
  }

  return { success: true }
}