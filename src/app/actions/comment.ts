'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'

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