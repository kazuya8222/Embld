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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000'
    
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000'
    
    return NextResponse.redirect(new URL('/auth/login', baseUrl))
  }
}