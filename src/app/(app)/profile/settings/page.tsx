import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm'

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // サーバーサイドでプロフィール情報を取得
  const { data: profile } = await supabase
    .from('users')
    .select('username, avatar_url, google_avatar_url, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">アカウント設定</h1>
      <ProfileSettingsForm 
        user={user}
        initialProfile={profile}
      />
    </div>
  )
}