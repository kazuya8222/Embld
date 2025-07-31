import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // フォースリフレッシュを使用してブラウザキャッシュを回避
      return NextResponse.redirect(new URL(`${next}?t=${Date.now()}`, requestUrl.origin))
    }
  }

  // 認証エラーの場合
  return NextResponse.redirect(new URL('/auth/login?error=auth_failed', requestUrl.origin))
}