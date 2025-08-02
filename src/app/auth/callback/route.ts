import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // 本番環境でのベースURLを動的に生成
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                 requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    try {
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
            return NextResponse.redirect(new URL('/auth/setup', baseUrl))
          }
        }
        
        // 既存ユーザーはホームへ
        return NextResponse.redirect(new URL('/home', baseUrl))
      } else {
        console.error('Session exchange error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=認証に失敗しました', baseUrl))
      }
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=認証処理中にエラーが発生しました', baseUrl))
    }
  }

  // エラーまたはコードなし - ログインページへ
  return NextResponse.redirect(new URL('/auth/login?error=認証に失敗しました', baseUrl))
}