'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function ownersLogin(formData: FormData) {
  const supabase = createSupabaseServerClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/owners/auth/login?error=' + encodeURIComponent(error.message))
  }

  // ユーザープロフィールを確認
  if (authData.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('username')
      .eq('id', authData.user.id)
      .single()

    // usernameが設定されていない場合はプロフィール設定ページへ
    if (!profile?.username) {
      revalidatePath('/', 'layout')
      redirect('/owners/profile/edit')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/owners')
}

export async function ownersSignup(formData: FormData) {
  const supabase = createSupabaseServerClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error: authError } = await supabase.auth.signUp(data)

  if (authError) {
    redirect('/owners/auth/register?error=' + encodeURIComponent(authError.message))
  }

  if (authData.user) {
    // ユーザープロフィールを作成（usernameはnullで作成）
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        username: null, // usernameは後で設定
        auth_provider: 'email',
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/owners/auth/login?message=メールを確認して認証を完了してください')
}

export async function ownersSignout() {
  console.log('Server action: Starting signout...')
  const supabase = createSupabaseServerClient()
  
  try {
    console.log('Server action: Calling Supabase signOut...')
    // サインアウト実行
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Server action: Signout error:', error)
    } else {
      console.log('Server action: Signout successful')
    }
    
    console.log('Server action: Clearing cache...')
    // 強制的にキャッシュをクリア
    revalidatePath('/', 'layout')
    revalidatePath('/owners/auth/login', 'page')
    revalidatePath('/owners', 'page')
    
    console.log('Server action: Redirecting to login...')
    // リダイレクト
    redirect('/owners/auth/login')
  } catch (error) {
    console.error('Server action: Unexpected error during signout:', error)
    redirect('/owners/auth/login')
  }
}

export async function ownersLoginWithGoogle() {
  const supabase = createSupabaseServerClient()
  
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
  
  console.log('Google login redirect URL:', `${baseUrl}/owners/auth/callback`)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/owners/auth/callback`,
    },
  })

  if (error) {
    console.error('Google login error:', error)
    redirect('/owners/auth/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    console.log('Redirecting to Google OAuth URL:', data.url)
    redirect(data.url)
  }
}