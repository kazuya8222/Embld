// Instagram風の超高速コメント投稿
import { createClient } from '@/lib/supabase/client'

// メモリキャッシュでセッション情報を保持
let cachedSession: { token: string; expires: number } | null = null

export async function postCommentInstant(ideaId: string, content: string) {
  // 1. キャッシュされたトークンを使用（最速）
  if (cachedSession && cachedSession.expires > Date.now()) {
    return postWithToken(ideaId, content, cachedSession.token)
  }

  // 2. ローカルストレージから直接取得（高速）
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Not authenticated')

  // セッションを30秒間キャッシュ
  cachedSession = {
    token: session.access_token,
    expires: Date.now() + 30000
  }

  return postWithToken(ideaId, content, session.access_token)
}

async function postWithToken(ideaId: string, content: string, token: string) {
  const supabase = createClient()
  
  // 楽観的にユーザー情報を取得（既にAuthProviderでキャッシュ済み）
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not found')

  // Supabase直接挿入（Edge Functionより高速な場合がある）
  const { data, error } = await supabase
    .from('comments')
    .insert({
      idea_id: ideaId,
      user_id: user.id,
      content: content.trim(),
    })
    .select(`
      *,
      user:users(username, avatar_url, google_avatar_url)
    `)
    .single()

  if (error) throw error
  return data
}