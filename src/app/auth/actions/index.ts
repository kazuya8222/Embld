'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

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
  const supabase = await createClient()

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
  const supabase = await createClient()
  
  try {
    // サインアウト実行
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Signout error:', error)
    }
    
    // 強制的にキャッシュをクリア
    revalidatePath('/', 'layout')
    revalidatePath('/auth/login', 'page')
    revalidatePath('/home', 'page')
    
    // リダイレクト
    redirect('/auth/login')
  } catch (error) {
    console.error('Unexpected error during signout:', error)
    redirect('/auth/login')
  }
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  
  // リダイレクトURLを動的に生成
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}