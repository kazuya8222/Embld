'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const toggleWant = async (ideaId: string) => {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if(!user) {
    redirect('/auth/login')
  }

  // 現在の状態を確認
  const { data: existingWant, error: selectError } = await supabase
    .from('wants')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (selectError) {
    throw new Error(selectError.message)
  }

  if (existingWant) {
    const { error: delErr } = await supabase
      .from('wants')
      .delete()
      .eq('id', existingWant.id)
    if (delErr) {
      throw new Error(delErr.message)
    }
  } else {
    const { error: insErr } = await supabase
      .from('wants')
      .insert({ idea_id: ideaId, user_id: user.id })
    // ユニーク制約の競合は並行トグルとみなして無視
    if (insErr && insErr.code !== '23505') {
      throw new Error(insErr.message)
    }
  }

  // サーバー真値で再同期
  const { count } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('idea_id', ideaId)

  const { data: now } = await supabase
    .from('wants')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', user.id)
    .maybeSingle()

  return { wanted: !!now, count: count ?? 0 }
}