import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">プロフィール情報</h2>
        <p className="text-gray-600">現在、プロフィール編集機能は開発中です。</p>
      </div>
    </div>
  )
}