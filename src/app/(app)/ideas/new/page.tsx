import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { IdeaForm } from '@/components/ideas/IdeaForm'

export default async function NewIdeaPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return <IdeaForm />
}