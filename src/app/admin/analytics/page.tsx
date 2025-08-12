import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient()

  // 各種統計データを取得
  const [
    { data: userStats },
    { data: ideaStats },
    { data: monthlyUsers },
    { data: monthlyIdeas },
    { data: categoryStats },
    { data: recentActivities }
  ] = await Promise.all([
    // ユーザー統計
    supabase.from('users').select(`
      created_at,
      account_status,
      last_login_at
    `),
    
    // アイデア統計
    supabase.from('ideas').select(`
      created_at,
      status,
      category,
      wants(count),
      comments(count)
    `),
    
    // 月別ユーザー登録数
    supabase.rpc('get_monthly_user_stats'),
    
    // 月別アイデア投稿数
    supabase.rpc('get_monthly_idea_stats'),
    
    // カテゴリ別統計
    supabase.from('ideas').select('category'),
    
    // 最近のアクティビティ
    supabase.from('ideas')
      .select(`
        id,
        title,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  // 最近のアクティビティのユーザー情報を取得
  const recentActivitiesWithUsers = await Promise.all(
    (recentActivities || []).map(async (activity: any) => {
      const { data: userData } = await supabase
        .from('users')
        .select('username, email')
        .eq('id', activity.user_id)
        .single()
      
      return {
        id: activity.id,
        title: activity.title,
        created_at: activity.created_at,
        users: userData || { username: null, email: 'Unknown' }
      }
    })
  )

  // データ処理
  const processedData = {
    userStats: {
      total: userStats?.length || 0,
      active: userStats?.filter(u => u.account_status === 'active').length || 0,
      newThisMonth: userStats?.filter(u => {
        const created = new Date(u.created_at)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length || 0,
      activeThisMonth: userStats?.filter(u => {
        if (!u.last_login_at) return false
        const lastLogin = new Date(u.last_login_at)
        const now = new Date()
        return lastLogin.getMonth() === now.getMonth() && lastLogin.getFullYear() === now.getFullYear()
      }).length || 0
    },
    ideaStats: {
      total: ideaStats?.length || 0,
      open: ideaStats?.filter(i => i.status === 'open').length || 0,
      inDevelopment: ideaStats?.filter(i => i.status === 'in_development').length || 0,
      completed: ideaStats?.filter(i => i.status === 'completed').length || 0
    },
    categoryStats: categoryStats?.reduce((acc: any, idea: any) => {
      acc[idea.category] = (acc[idea.category] || 0) + 1
      return acc
    }, {}) || {},
    monthlyUsers: monthlyUsers || [],
    monthlyIdeas: monthlyIdeas || [],
    recentActivities: recentActivitiesWithUsers
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">統計・分析</h1>
        <p className="text-gray-600 mt-2">プラットフォームの利用状況とトレンド分析</p>
      </div>

      <AnalyticsDashboard data={processedData} />
    </div>
  )
}