'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

type IdeaPayload = Record<string, any>

export async function saveIdeaFromAI(payload: IdeaPayload, ideaId?: string) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, id: null, error: 'UNAUTHENTICATED' }
  }

  const dataToSave = { ...payload, user_id: user.id }

  if (ideaId) {
    // 自分のアイデアのみ更新
    const { data, error } = await supabase
      .from('ideas')
      .update(dataToSave)
      .eq('id', ideaId)
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle()

    if (error) {
      return { ok: false, id: null, error: error.message }
    }

    return { ok: true, id: data?.id ?? ideaId }
  }

  const { data, error } = await supabase
    .from('ideas')
    .insert(dataToSave)
    .select('id')
    .single()

  if (error) {
    return { ok: false, id: null, error: error.message }
  }

  return { ok: true, id: data.id }
}

