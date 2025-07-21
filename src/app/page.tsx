import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { 
  Heart, 
  MessageSquare, 
  Rocket, 
  Plus, 
  TrendingUp, 
  Users, 
  Code, 
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Zap,
  Clock,
  Filter
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  
  // アイデア一覧（「欲しい！」とコメント数、完成アプリも取得）
  const { data: ideas } = await supabase
    .from('ideas')
    .select(`
      *,
      wants(count),
      comments(count),
      users(username, avatar_url),
      completed_apps(
        id,
        app_name,
        developer:users(username)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(12)

  // 完成アプリ（レビューも含む）
  const { data: apps } = await supabase
    .from('completed_apps')
    .select(`
      *,
      reviews(rating),
      users(username, avatar_url),
      ideas(title)
    `)
    .order('created_at', { ascending: false })
    .limit(6)

  // 統計データ
  const { count: ideasCount } = await supabase.from('ideas').select('*', { count: 'exact' })
  const { count: appsCount } = await supabase.from('completed_apps').select('*', { count: 'exact' })
  const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact' })
  const { count: wantsCount } = await supabase.from('wants').select('*', { count: 'exact' })
  
  // トレンディングアイデア（24時間以内のwants数でソート）
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  const { data: trendingIdeas } = await supabase
    .from('ideas')
    .select(`
      *,
      wants!inner(created_at),
      wants_count:wants(count),
      users(username)
    `)
    .gte('wants.created_at', yesterday.toISOString())
    .order('wants_count', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダーセクション */}
      <header className="bg-white shadow-sm border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">IdeaSpark</h1>
              <p className="text-base text-gray-600 mt-1 font-light">アイデアからアプリが生まれるマーケットプレイス</p>
            </div>
            <Link
              href="/ideas/new"
              className="bg-teal-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-teal-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              アイデアを投稿
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* トレンディングセクション */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* トレンディングアイデア */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-amber-500" />
                  トレンディング
                </h2>
                <span className="text-sm text-gray-500 font-medium">24時間</span>
              </div>
            </div>
            <div className="p-8 space-y-5">
              {trendingIdeas && trendingIdeas.length > 0 ? (
                trendingIdeas.map((idea: any, index: number) => (
                  <Link
                    key={idea.id}
                    href={`/ideas/${idea.id}`}
                    className="block hover:bg-gray-50 -mx-4 px-4 py-3 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 truncate leading-tight">
                          {idea.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 font-light">
                          {idea.users?.username} • {idea.wants_count?.[0]?.count || 0} wants
                        </p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-base text-gray-500 text-center py-12 font-light">
                  まだトレンドデータがありません
                </p>
              )}
            </div>
          </div>

          {/* アイデア一覧 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">最新のアイデア</h2>
                <div className="flex items-center gap-4">
                  <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors">
                    <Filter className="w-4 h-4" />
                    フィルター
                  </button>
                  <Link
                    href="/ideas"
                    className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    すべて見る
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-8">
              {ideas && ideas.length > 0 ? (
                <div className="space-y-6">
                  {ideas.slice(0, 6).map((idea: any) => {
                    const wantCount = idea.wants?.[0]?.count || 0
                    const commentCount = idea.comments?.[0]?.count || 0
                    
                    return (
                      <Link
                        key={idea.id}
                        href={`/ideas/${idea.id}`}
                        className="block hover:bg-gray-50 -mx-4 px-4 py-4 rounded-lg transition-all duration-200 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-start gap-5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                                {idea.category}
                              </span>
                              {idea.completed_apps && idea.completed_apps.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-sm text-green-600 font-semibold">
                                  <CheckCircle className="w-4 h-4" />
                                  実装済み
                                </span>
                              )}
                              {idea.status === 'open' && wantCount < 10 && (
                                <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-semibold">
                                  <Zap className="w-4 h-4" />
                                  早期特典
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
                              {idea.title}
                            </h3>
                            <p className="text-base text-gray-600 line-clamp-1 font-light">
                              {idea.problem}
                            </p>
                            <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                              <span className="font-medium">{idea.users?.username || '匿名'}</span>
                              <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {new Date(idea.created_at).toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-2 text-base">
                                  <Heart className="w-5 h-5 text-red-500" />
                                  <span className="font-bold text-gray-900">{wantCount}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-2 text-base text-gray-500">
                                  <MessageSquare className="w-5 h-5" />
                                  <span className="font-semibold">{commentCount}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 font-light text-lg">まだアイデアがありません</p>
                  <Link
                    href="/ideas/new"
                    className="text-teal-600 hover:text-teal-700 font-semibold text-base mt-3 inline-block"
                  >
                    最初のアイデアを投稿する
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 完成アプリセクション */}
        {apps && apps.length > 0 && (
          <section className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Rocket className="w-6 h-6 text-blue-500" />
                  最新リリース
                </h2>
                <Link
                  href="/apps"
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                >
                  すべて見る
                </Link>
              </div>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map((app: any) => {
                  const avgRating = app.reviews?.length > 0 
                    ? app.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / app.reviews.length
                    : 0
                  
                  return (
                    <Link
                      key={app.id}
                      href={`/apps/${app.id}`}
                      className="block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200 border border-gray-100 hover:shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">
                            {app.app_name}
                          </h3>
                          {avgRating > 0 && (
                            <div className="flex items-center gap-1 text-base">
                              <Activity className="w-5 h-5 text-yellow-500" />
                              <span className="font-bold">{avgRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        
                        {app.description && (
                          <p className="text-base text-gray-600 line-clamp-2 font-light">
                            {app.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            <span className="font-medium">{app.users?.username || '開発者'}</span>
                          </span>
                          <span className="font-light">{new Date(app.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}