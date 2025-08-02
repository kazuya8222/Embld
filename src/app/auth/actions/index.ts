'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

// 動的にオリジンを取得する関数
async function getOrigin() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  return `${protocol}://${host}`
}

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
  
  // サインアウト実行
  await supabase.auth.signOut()

  // 強制的にキャッシュをクリア
  revalidatePath('/', 'layout')
  
  // リダイレクト
  redirect('/auth/login')
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  
  // 動的にオリジンを取得
  const origin = await getOrigin()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    },
  })

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}