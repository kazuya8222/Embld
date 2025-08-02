import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // ベースURLを確実に設定
  let baseUrl = 'https://www.em-bld.com'
  
  // 開発環境の場合はlocalhostを使用
  if (process.env.NODE_ENV === 'development') {
    baseUrl = 'http://localhost:3000'
  }
  
  // 環境変数が設定されている場合はそれを使用
  if (process.env.NEXT_PUBLIC_APP_URL) {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL
  }

  console.log('Callback baseUrl:', baseUrl)
  console.log('Request URL:', requestUrl.toString())

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && session) {
        console.log('Session created successfully for user:', session.user.email)
        
        // ユーザープロフィールを確認
        const { data: profile } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single()
        
        // プロフィールが存在しないか、usernameが設定されていない場合は初回ログイン
        if (!profile || !profile.username) {
          console.log('Creating new user profile for:', session.user.email)
          
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
            console.log('Redirecting to setup page')
            return NextResponse.redirect(new URL('/auth/setup', baseUrl))
          } else {
            console.error('Profile creation error:', insertError)
          }
        }
        
        // 既存ユーザーはホームへ
        console.log('Redirecting to home page')
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
  console.log('No code provided, redirecting to login')
  return NextResponse.redirect(new URL('/auth/login?error=認証に失敗しました', baseUrl))
}