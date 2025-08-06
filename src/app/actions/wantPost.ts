'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const toggleWant = async (ideaId: string) => {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if(!user) {
    redirect('/auth/login')
  }

  const { data: existingWant } = await supabase
    .from('wants')
    .select('*')
    .eq('idea_id', ideaId)
    .eq('user_id', user.id)
    .maybeSingle()

  if(existingWant) {
    await supabase.from('wants').delete().eq('id', existingWant.id)
    return {wanted: false, count: 0}
  }else {
    await supabase.from('wants').insert({
      idea_id: ideaId,
      user_id: user.id,
    })
    return {wanted: true, count: 1}
  }
}