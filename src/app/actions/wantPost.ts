'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'

// セッション情報をキャッシュして再利用
let cachedUser: { id: string; timestamp: number } | null = null

export const toggleWant = async (ideaId: string) => {
  const supabase = createSupabaseServerClient()
  
  // キャッシュされたユーザー情報を使用（5秒間有効）
  let userId: string
  if (cachedUser && Date.now() - cachedUser.timestamp < 5000) {
    userId = cachedUser.id
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) {
      redirect('/auth/login')
    }
    cachedUser = { id: user.id, timestamp: Date.now() }
    userId = user.id
  }

  // トランザクション的な処理を一度に実行
  const [existingResult, _] = await Promise.all([
    supabase
      .from('wants')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .maybeSingle(),
    // プリフェッチ: カウントクエリも同時実行
    supabase
      .from('wants')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
  ])

  if (existingResult.error) {
    throw new Error(existingResult.error.message)
  }

  // 楽観的更新: 削除/挿入を非同期で実行
  if (existingResult.data) {
    await supabase
      .from('wants')
      .delete()
      .eq('id', existingResult.data.id)
  } else {
    await supabase
      .from('wants')
      .insert({ idea_id: ideaId, user_id: userId })
  }

  // キャッシュを無効化
  revalidateTag('ideas')
  
  // 最新カウントを取得
  const { count } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('idea_id', ideaId)

  return { wanted: !existingResult.data, count: count ?? 0 }
}

export const toggleWantForm = async (prevState: any, formData: FormData) => {
  const ideaId = formData.get('ideaId') as string
  return toggleWant(ideaId)
}