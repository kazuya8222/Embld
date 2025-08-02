import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      // ユーザープロフィールを確認
      const { data: profile } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .single()
      
      // プロフィールが存在しないか、usernameが設定されていない場合は初回ログイン
      if (!profile || !profile.username) {
        return NextResponse.redirect(new URL('/auth/setup', requestUrl.origin))
      }
      
      // 既存ユーザーはホームへ
      return NextResponse.redirect(new URL('/home', requestUrl.origin))
    }
  }

  // エラーまたはコードなし - ログインページへ
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}