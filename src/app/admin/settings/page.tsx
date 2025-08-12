import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SettingsManager } from '@/components/admin/SettingsManager'

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient()

  // カテゴリとタグを取得
  const [
    { data: categories },
    { data: tags },
    { data: systemSettings }
  ] = await Promise.all([
    supabase.from('categories').select('*').order('created_at', { ascending: false }),
    supabase.from('tags').select('*').order('created_at', { ascending: false }),
    supabase.from('system_settings').select('*')
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">運営設定</h1>
        <p className="text-gray-600 mt-2">プラットフォームの設定・管理者権限・コンテンツ管理</p>
      </div>

      <SettingsManager 
        categories={categories || []}
        tags={tags || []}
        systemSettings={systemSettings || []}
      />
    </div>
  )
}