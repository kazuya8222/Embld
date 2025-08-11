// Supabase Edge Functions クライアント
import { createClient } from '@/lib/supabase/client'

const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1'

// アイデア一覧を高速取得
export async function fetchIdeasFromEdge(params: {
  category?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(`${EDGE_FUNCTION_URL}/optimize-ideas-fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch ideas')
  }

  return response.json()
}

// コメント投稿を高速化（Instagram風）
export async function postCommentViaEdge(ideaId: string, content: string) {
  // セッション取得を省略してトークンを直接使用
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('supabase.auth.token') 
    : null
  
  const accessToken = token ? JSON.parse(token).currentSession?.access_token : null
  
  if (!accessToken) {
    // フォールバック：通常のセッション取得
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Unauthorized')
    
    return fetch(`${EDGE_FUNCTION_URL}/fast-comment-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ ideaId, content }),
    }).then(res => res.ok ? res.json() : Promise.reject(res))
  }

  // 高速パス：既存トークンを使用
  return fetch(`${EDGE_FUNCTION_URL}/fast-comment-post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify({ ideaId, content }),
  }).then(res => res.ok ? res.json() : Promise.reject(res))
}