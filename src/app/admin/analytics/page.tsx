import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient()

  // 各種統計データを取得
  const [
    { data: userStats },
    { data: proposalStats },
    { data: productStats },
    { data: recentProposals },
    { data: recentProducts },
    { data: revenueData }
  ] = await Promise.all([
    // ユーザー統計
    supabase.from('users').select(`
      created_at,
      account_status,
      last_login_at,
      subscription_plan,
      credits_balance
    `),
    
    // 企画書統計
    supabase.from('proposals').select(`
      created_at,
      status,
      service_name
    `),
    
    // プロダクト統計
    supabase.from('products').select(`
      created_at,
      status,
      category
    `),
    
    // 最近の企画書
    supabase.from('proposals')
      .select(`
        id,
        service_name,
        created_at,
        user_id,
        status
      `)
      .order('created_at', { ascending: false })
      .limit(10),
      
    // 最近のプロダクト
    supabase.from('products')
      .select(`
        id,
        title,
        created_at,
        status
      `)
      .order('created_at', { ascending: false })
      .limit(10),
      
    // 収益データ
    supabase.from('revenue_analytics').select(`
      date,
      revenue,
      transaction_count
    `)
  ])

  // 最近の企画書のユーザー情報を取得
  const recentProposalsWithUsers = await Promise.all(
    (recentProposals || []).map(async (proposal: any) => {
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', proposal.user_id)
        .single()
      
      return {
        id: proposal.id,
        title: proposal.service_name,
        created_at: proposal.created_at,
        status: proposal.status,
        user_email: userData?.email || 'Unknown'
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
      premiumUsers: userStats?.filter(u => u.subscription_plan !== 'free').length || 0
    },
    proposalStats: {
      total: proposalStats?.length || 0,
      pending: proposalStats?.filter(p => p.status === '審査中').length || 0,
      approved: proposalStats?.filter(p => p.status === '承認済み').length || 0,
      rejected: proposalStats?.filter(p => p.status === '却下').length || 0
    },
    productStats: {
      total: productStats?.length || 0,
      development: productStats?.filter(p => p.status === 'development').length || 0,
      testing: productStats?.filter(p => p.status === 'testing').length || 0,
      launched: productStats?.filter(p => p.status === 'launched').length || 0
    },
    revenueStats: {
      totalRevenue: revenueData?.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0) || 0,
      totalTransactions: revenueData?.reduce((sum: number, r: any) => sum + (r.transaction_count || 0), 0) || 0
    },
    recentProposals: recentProposalsWithUsers,
    recentProducts: recentProducts || []
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