// Instagram風の超高速コメント投稿
import { createClient } from '@/lib/supabase/client'

// グローバルクライアントインスタンスを再利用
const supabase = createClient()

// メモリキャッシュでユーザー情報を保持
let cachedUser: { id: string; expires: number } | null = null

export async function postCommentInstant(ideaId: string, content: string, userInfo?: { id: string; username: string; avatar_url?: string }) {
  try {
    // ユーザー情報が渡されている場合は、それを使用（最速）
    if (userInfo?.id) {
      return await fastInsert(ideaId, content, userInfo.id, userInfo)
    }

    // キャッシュされたユーザー情報を使用
    if (cachedUser && cachedUser.expires > Date.now()) {
      return await fastInsert(ideaId, content, cachedUser.id)
    }

    // セッションから取得（初回のみ）
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    // ユーザーIDを60秒間キャッシュ
    cachedUser = {
      id: session.user.id,
      expires: Date.now() + 60000
    }

    return await fastInsert(ideaId, content, session.user.id)
  } catch (error) {
    console.error('Fast comment error:', error)
    throw error
  }
}

async function fastInsert(ideaId: string, content: string, userId: string, userInfo?: any) {
  // シンプルな挿入のみ（JOINを避ける）
  const { data, error } = await supabase
    .from('comments')
    .insert({
      idea_id: ideaId,
      user_id: userId,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) throw error

  // ユーザー情報が渡されていれば、それを使って即座に返す
  if (userInfo) {
    return {
      ...data,
      user: {
        username: userInfo.username,
        avatar_url: userInfo.avatar_url
      }
    }
  }

  // ユーザー情報を別途取得（必要な場合のみ）
  const { data: userData } = await supabase
    .from('users')
    .select('username, avatar_url, google_avatar_url')
    .eq('id', userId)
    .single()

  return {
    ...data,
    user: userData || { username: 'User' }
  }
}