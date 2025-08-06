'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export const addComment = async (ideaId: string, content: string) => {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (!content.trim()) {
    throw new Error('コメント内容を入力してください')
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      idea_id: ideaId,
      user_id: user.id,
      content: content.trim(),
    })
    .select(`
      *,
      user:users(username, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Comment insert error:', error)
    throw new Error(`コメントの投稿に失敗しました: ${error.message}`)
  }

  // ページを再検証して最新のコメントを表示
  revalidatePath(`/ideas/${ideaId}`)
  
  return data
}