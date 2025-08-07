import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  User, 
  Lightbulb, 
  Heart, 
  MessageCircle, 
  DollarSign,
  Settings,
  Crown,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: myIdeas } = await supabase
    .from('ideas')
    .select(`
      *,
      wants(id),
      comments(id)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const { data: myWants } = await supabase
    .from('wants')
    .select(`
      *,
      idea:ideas(
        id,
        title,
        category,
        status,
        user:users(username)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  // 収益情報を取得
  const { data: revenueShares } = await supabase
    .from('revenue_shares')
    .select(`
      *,
      app:completed_apps(
        id,
        app_name,
        idea:ideas(title)
      )
    `)
    .eq('user_id', session.user.id)

  const { data: distributions } = await supabase
    .from('revenue_distributions')
    .select(`
      *,
      app:completed_apps(app_name)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: myComments } = await supabase
    .from('comments')
    .select(`
      *,
      idea:ideas(
        id,
        title,
        user:users(username)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const myIdeasWithStats = myIdeas?.map(idea => ({
    ...idea,
    wants_count: idea.wants?.length || 0,
    comments_count: idea.comments?.length || 0,
  })) || []

  const totalRevenue = distributions?.reduce((sum, dist) => sum + (dist.amount || 0), 0) || 0
  const pendingRevenue = distributions?.filter(d => d.status === 'pending').reduce((sum, dist) => sum + (dist.amount || 0), 0) || 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {userProfile?.avatar_url || userProfile?.google_avatar_url ? (
                <img
                  src={userProfile.avatar_url || userProfile.google_avatar_url}
                  alt={userProfile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-600" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userProfile?.username}
                </h1>
                {userProfile?.is_premium && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                    <Crown className="w-4 h-4" />
                    <span>プレミアム</span>
                  </div>
                )}
                {userProfile?.is_admin && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    <Settings className="w-4 h-4" />
                    <span>管理者</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600">{userProfile?.email}</p>
              
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>登録日: {formatDate(userProfile?.created_at || '')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile/settings"
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              設定
            </Link>
            
            {userProfile?.is_admin && (
              <Link
                href="/admin/apps"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                管理画面
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{myIdeasWithStats.length}</div>
            <div className="text-gray-600 text-sm">投稿したアイデア</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{myWants?.length || 0}</div>
            <div className="text-gray-600 text-sm">「欲しい！」したアイデア</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">¥{totalRevenue.toLocaleString()}</div>
            <div className="text-gray-600 text-sm">累計収益</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{myComments?.length || 0}</div>
            <div className="text-gray-600 text-sm">コメント数</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                投稿したアイデア
              </h2>
              <Link
                href="/ideas/new"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                新しく投稿
              </Link>
            </div>

            {myIdeasWithStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>まだアイデアを投稿していません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myIdeasWithStats.slice(0, 3).map((idea) => (
                  <div key={idea.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {idea.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {idea.wants_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {idea.comments_count}
                          </span>
                          <span className="text-xs">{formatDate(idea.created_at)}</span>
                        </div>
                      </div>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        idea.status === 'open' ? 'bg-green-100 text-green-700' :
                        idea.status === 'in_development' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {idea.status === 'open' ? '募集中' :
                         idea.status === 'in_development' ? '開発中' : '完成'}
                      </span>
                    </div>
                  </div>
                ))}
                {myIdeasWithStats.length > 3 && (
                  <Link
                    href="/profile/ideas"
                    className="block text-center text-primary-600 hover:text-primary-700 text-sm py-2"
                  >
                    すべて見る ({myIdeasWithStats.length - 3}件)
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-600" />
              「欲しい！」したアイデア
            </h2>

            {!myWants || myWants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>まだ「欲しい！」したアイデアはありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myWants.slice(0, 3).map((want) => (
                  <div key={want.id} className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {want.idea.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{want.idea.category}</span>
                        <span>•</span>
                        <span>by {want.idea.user.username}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        want.idea.status === 'open' ? 'bg-green-100 text-green-700' :
                        want.idea.status === 'in_development' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {want.idea.status === 'open' ? '募集中' :
                         want.idea.status === 'in_development' ? '開発中' : '完成'}
                      </span>
                    </div>
                  </div>
                ))}
                {myWants.length > 3 && (
                  <Link
                    href="/profile/wants"
                    className="block text-center text-primary-600 hover:text-primary-700 text-sm py-2"
                  >
                    すべて見る ({myWants.length - 3}件)
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              収益情報
            </h2>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">累計収益</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700">¥{totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">
                  うち未払い: ¥{pendingRevenue.toLocaleString()}
                </div>
              </div>

              {distributions && distributions.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">最近の収益</h3>
                  {distributions.slice(0, 3).map((dist) => (
                    <div key={dist.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{dist.app?.app_name}</div>
                        <div className="text-xs text-gray-500">{dist.share_type === 'idea_creator' ? 'アイデア投稿' : dist.share_type === 'want' ? '「ほしい！」' : 'コメント'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">¥{dist.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          {dist.status === 'paid' ? '支払い済み' : '未払い'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">まだ収益がありません</p>
                  <p className="text-xs mt-1">アイデアを投稿したり、「ほしい！」やコメントで貢献しましょう</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              最近のコメント
            </h2>

            {!myComments || myComments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>まだコメントしていません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myComments.slice(0, 3).map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        {comment.idea.title} • by {comment.idea.user.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}