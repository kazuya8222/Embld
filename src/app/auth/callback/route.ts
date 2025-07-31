import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Auth callback triggered:', { 
    url: requestUrl.toString(), 
    code: code ? 'present' : 'missing' 
  })

  if (code) {
    try {
      const supabase = await createClient()
      
      console.log('Exchanging code for session...')
      const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (authError) {
        console.error('Auth exchange error:', authError)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent(authError.message)}`)
      }
      
      if (authData.user) {
        console.log('User authenticated:', authData.user.email)
        
        // ユーザープロフィールの確認と作成
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', authData.user.id)
          .single()

        if (!existingUser) {
          console.log('Creating new user profile...')
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email!,
              username: authData.user.user_metadata?.name || authData.user.email!.split('@')[0],
              google_avatar_url: authData.user.user_metadata?.avatar_url,
              auth_provider: 'google',
            })
          
          if (insertError) {
            console.error('Error creating user profile:', insertError)
          } else {
            console.log('User profile created successfully')
          }
        } else {
          console.log('User profile already exists')
        }

        // 認証成功後、リダイレクトレスポンスを作成
        const response = NextResponse.redirect(`${requestUrl.origin}/home`)
        
        // セッションをクッキーに設定
        response.cookies.set('sb-auth-token', 'authenticated', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1週間
        })

        return response
      }
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_failed`)
    }
  }

  // コードがない場合はログインページへ
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}