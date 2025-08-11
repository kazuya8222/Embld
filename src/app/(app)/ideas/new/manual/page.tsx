import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ManualIdeaForm } from '@/components/ideas/ManualIdeaForm'

export default async function NewIdeaManualPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return <ManualIdeaForm />
}