import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

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
        // Google認証の場合、ユーザープロフィールを作成
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email!,
            username: session.user.email!.split('@')[0], // デフォルトのユーザー名
            auth_provider: 'google',
          })
        
        if (!insertError) {
          return NextResponse.redirect(new URL('/auth/setup', origin))
        }
      }
      
      // 既存ユーザーはホームへ
      return NextResponse.redirect(new URL('/home', origin))
    }
  }

  // エラーまたはコードなし - ログインページへ
  return NextResponse.redirect(new URL('/auth/login?error=認証に失敗しました', origin))
}