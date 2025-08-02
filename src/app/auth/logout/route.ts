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
    
    // ログインページへリダイレクト
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  } catch (error) {
    console.error('Unexpected error during signout:', error)
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  }
}