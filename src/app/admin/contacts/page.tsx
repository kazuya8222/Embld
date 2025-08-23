import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ContactsClient from './ContactsClient'

interface Contact {
  id: string
  name: string
  email: string
  company?: string
  category: string
  message: string
  status: string
  created_at: string
  updated_at: string
}

export default async function AdminContactsPage() {
  const supabase = createSupabaseServerClient()
  
  // Check if user is authenticated and is admin
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!userProfile?.is_admin) {
    redirect('/home')
  }

  // Fetch all contacts
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
  }

  return <ContactsClient contacts={contacts || []} />
}