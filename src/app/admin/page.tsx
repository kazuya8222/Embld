import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/admin/DashboardStats'

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient()

  // 基本統計データを取得
  const [
    { count: totalUsers },
    { count: totalIdeas },
    { count: pendingIdeas },
    { count: activeUsers },
    { count: totalContacts },
    { count: unreadContacts }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('ideas').select('*', { count: 'exact', head: true }),
    supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('account_status', 'active'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'unread')
  ])

  const stats = {
    totalUsers: totalUsers || 0,
    totalIdeas: totalIdeas || 0,
    pendingIdeas: pendingIdeas || 0,
    activeUsers: activeUsers || 0,
    totalContacts: totalContacts || 0,
    unreadContacts: unreadContacts || 0
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="text-gray-600 mt-2">EmBldプラットフォームの運営管理</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">最近のアクティビティ</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">新規ユーザー登録</span>
              <span className="text-sm font-medium">5件 (今日)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">新規アイデア投稿</span>
              <span className="text-sm font-medium">12件 (今日)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">承認待ちアイデア</span>
              <span className="text-sm font-medium text-orange-600">{stats.pendingIdeas}件</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">未読お問い合わせ</span>
              <span className="text-sm font-medium text-red-600">{stats.unreadContacts}件</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">クイックアクション</h3>
          <div className="space-y-3">
            <a 
              href="/admin/users" 
              className="block p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-900">ユーザー管理</div>
              <div className="text-sm text-blue-600">ユーザー一覧・権限管理</div>
            </a>
            <a 
              href="/admin/ideas" 
              className="block p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-900">アイデア管理</div>
              <div className="text-sm text-green-600">投稿の承認・編集</div>
            </a>
            <a 
              href="/admin/contacts" 
              className="block p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <div className="font-medium text-orange-900">お問い合わせ管理</div>
              <div className="text-sm text-orange-600">顧客サポート・問い合わせ対応</div>
            </a>
            <a 
              href="/admin/settings" 
              className="block p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-900">運営設定</div>
              <div className="text-sm text-purple-600">カテゴリ・タグ管理</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}