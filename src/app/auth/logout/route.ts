import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  try {
    // サインアウト
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Signout error:', error)
    }
    
    // キャッシュをクリア
    revalidatePath('/', 'layout')
    revalidatePath('/auth/login', 'page')
    revalidatePath('/home', 'page')
    
    // 本番環境でのリダイレクトURLを動的に生成
    let baseUrl = 'https://www.em-bld.com'
    
    // 開発環境の場合はlocalhostを使用
    if (process.env.NODE_ENV === 'development') {
      baseUrl = 'http://localhost:3000'
    }
    
    // 環境変数が設定されている場合はそれを使用
    if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL
    }
    
    const redirectUrl = new URL('/auth/login', baseUrl)
    
    // レスポンスを作成
    const response = NextResponse.redirect(redirectUrl)
    
    // 認証関連のCookieをクリア
    const cookieNames = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase.auth.token'
    ]
    
    cookieNames.forEach(name => {
      response.cookies.set({
        name,
        value: '',
        expires: new Date(0),
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })
    
    return response
  } catch (error) {
    console.error('Unexpected error during signout:', error)
    
    // エラーが発生してもリダイレクト
    let baseUrl = 'https://www.em-bld.com'
    
    if (process.env.NODE_ENV === 'development') {
      baseUrl = 'http://localhost:3000'
    }
    
    if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL
    }
    
    return NextResponse.redirect(new URL('/auth/login', baseUrl))
  }
}