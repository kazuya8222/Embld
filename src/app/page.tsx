import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Heart, MessageSquare, Rocket, Plus, TrendingUp, Gift, Users, Crown, Target } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  
  // アイデア一覧（「欲しい！」とコメント数も取得）
  const { data: ideas } = await supabase
    .from('ideas')
    .select(`
      *,
      wants(count),
      comments(count),
      users(username, avatar_url)
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

  return (
    <div className="space-y-8">
      {/* ヒーローセクション - 簡潔に */}
      <section className="text-center py-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Link
            href="/ideas/new"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            アイデアを投稿
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {ideasCount || 0}個のアイデア
            </span>
            <span>→</span>
            <span>{appsCount || 0}個のアプリが完成</span>
          </div>
        </div>
        <p className="text-gray-600 max-w-4xl mx-auto mb-6">
          「こんなアプリ欲しい！」を投稿すると、開発者が実際に作ってくれます。
          <br />
          <strong>早く応援するほどお得に使える</strong>画期的なシステムです。
        </p>

        {/* 価値提案カード */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-8">
          {/* アイデア投稿者 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900">アイデア投稿者</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-orange-500" />
                <span>採用されたら<strong>永久無料</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                <span>自分の困りごとが解決</span>
              </div>
            </div>
          </div>

          {/* 応援者 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200 relative">
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              お得！
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-green-900">応援者</h3>
            </div>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span><strong>早い者勝ち価格</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>有用コメントで<strong>無料特典</strong></span>
              </div>
            </div>
          </div>

          {/* 開発者 */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900">開発者</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span><strong>需要の可視化</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span>熱心なファン獲得</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* アイデア一覧 - メインコンテンツ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">💡 みんなのアイデア</h2>
          <Link
            href="/ideas"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            もっと見る →
          </Link>
        </div>
        
        {ideas && ideas.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea: any, index: number) => {
              const wantCount = idea.wants?.[0]?.count || 0
              const commentCount = idea.comments?.[0]?.count || 0
              
              return (
                <Link
                  key={idea.id}
                  href={`/ideas/${idea.id}`}
                  className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-primary-200 relative"
                >
                  {/* 早期サポーター特典バッジ */}
                  {idea.status === 'open' && wantCount < 10 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      早割チャンス
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {idea.category}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        idea.status === 'open' ? 'bg-green-100 text-green-700' :
                        idea.status === 'in_development' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {idea.status === 'open' ? '募集中' :
                         idea.status === 'in_development' ? '開発中' : '完成'}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                      {idea.title}
                    </h3>
                    
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {idea.problem}
                    </p>
                    
                    {/* 早期サポーター特典説明 */}
                    {idea.status === 'open' && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-2 rounded text-xs">
                        <div className="flex items-center gap-1 text-green-700 font-medium">
                          <Crown className="w-3 h-3 text-yellow-500" />
                          <span>今「欲しい！」すると</span>
                        </div>
                        <div className="text-green-600">
                          {wantCount < 5 ? '最安価格で利用可能！' :
                           wantCount < 10 ? '早割価格で利用可能' :
                           'お得な価格で利用可能'}
                        </div>
                      </div>
                    )}
                    
                    {/* 投稿者と反応数 */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <span>{idea.users?.username || '匿名'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="font-medium">{wantCount}</span>
                          {wantCount < 10 && <span className="text-green-600">番目</span>}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-blue-500" />
                          <span>{commentCount}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">まだアイデアがありません</p>
            <Link
              href="/ideas/new"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              最初のアイデアを投稿しませんか？
            </Link>
          </div>
        )}
      </section>

      {/* 完成アプリ - 価値を示す */}
      {apps && apps.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🚀 完成したアプリ
            <span className="text-sm font-normal text-green-600">実際に作られました！</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app: any) => {
              const avgRating = app.reviews?.length > 0 
                ? app.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / app.reviews.length
                : 0
              
              return (
                <Link
                  key={app.id}
                  href={`/apps/${app.id}`}
                  className="block bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-green-100 hover:border-green-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">完成アプリ</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {app.app_name}
                    </h3>
                    
                    {app.ideas?.title && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        元アイデア: {app.ideas.title}
                      </p>
                    )}
                    
                    {app.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {app.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-green-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <div className="w-4 h-4 bg-green-300 rounded-full"></div>
                        <span>{app.users?.username || '開発者'}</span>
                      </div>
                      {avgRating > 0 && (
                        <div className="text-xs text-yellow-600 font-medium">
                          ⭐ {avgRating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}