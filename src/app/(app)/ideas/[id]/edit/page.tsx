import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { IdeaForm } from '@/components/ideas/IdeaForm'

export default async function EditIdeaPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    notFound()
  }

  const { data: idea, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (error || !idea) {
    notFound()
  }

  return <IdeaForm initialData={idea} ideaId={idea.id} />
}