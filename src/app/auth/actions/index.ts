'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createSupabaseServerClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signup(formData: FormData) {
  const supabase = createSupabaseServerClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        username: formData.get('username') as string,
      },
    },
  }

  const { data: authData, error: authError } = await supabase.auth.signUp(data)

  if (authError) {
    redirect('/auth/register?error=' + encodeURIComponent(authError.message))
  }

  if (authData.user) {
    // ユーザープロフィールを作成
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        username: formData.get('username') as string,
        auth_provider: 'email',
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/login?message=メールを確認して認証を完了してください')
}

export async function signout() {
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
    revalidatePath('/auth/login', 'page')
    revalidatePath('/home', 'page')
    
    console.log('Server action: Redirecting to login...')
    // リダイレクト
    redirect('/auth/login')
  } catch (error) {
    console.error('Server action: Unexpected error during signout:', error)
    redirect('/auth/login')
  }
}

export async function loginWithGoogle() {
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
  
  console.log('Google login redirect URL:', `${baseUrl}/auth/callback`)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  })

  if (error) {
    console.error('Google login error:', error)
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    console.log('Redirecting to Google OAuth URL:', data.url)
    redirect(data.url)
  }
}