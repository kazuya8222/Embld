import { createClient } from '@/utils/supabase/server'
import { ProductHuntIdeaItem } from '@/components/ideas/ProductHuntIdeaItem'
import { CATEGORIES } from '@/types'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronUp, MessageCircle, Search, Filter, TrendingUp, Clock, Sparkles } from 'lucide-react'

interface SearchParams {
  category?: string
  status?: string
  search?: string
  sort?: string
  date?: string
}

interface HomePageIdea {
  id: string
  title: string
  problem: string
  category: string
  status: string
  created_at: string
  tags?: string[]
  user: {
    username: string
    avatar_url?: string
  }
  wants_count: number
  comments_count: number
  user_has_wanted: boolean
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // 未認証の場合はログインページへ
  if (!session) {
    redirect('/auth/login')
  }
  
  let query = supabase
    .from('ideas')
    .select(`
      id,
      title,
      problem,
      category,
      status,
      created_at,
      tags,
      user:users(username, avatar_url)
    `)
    .limit(50)

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,problem.ilike.%${searchParams.search}%`)
  }

  // 日付フィルタ
  const today = new Date()
  if (searchParams.date === 'today') {
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    query = query.gte('created_at', startOfDay.toISOString())
  } else if (searchParams.date === 'week') {
    const weekAgo = new Date(today.setDate(today.getDate() - 7))
    query = query.gte('created_at', weekAgo.toISOString())
  }

  const sortBy = searchParams.sort || 'wants'
  query = query.order('created_at', { ascending: false })

  const { data: ideas, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return <div>アイデアの取得に失敗しました</div>
  }

  const ideaIds = ideas?.map(idea => idea.id) || []
  
  const [wantsResult, commentsResult, userWantsResult] = await Promise.all([
    supabase
      .from('wants')
      .select('idea_id')
      .in('idea_id', ideaIds),
    
    supabase
      .from('comments')
      .select('idea_id')
      .in('idea_id', ideaIds),
    
    session?.user?.id ? supabase
      .from('wants')
      .select('idea_id')
      .eq('user_id', session.user.id)
      .in('idea_id', ideaIds) : Promise.resolve({ data: [] })
  ])

  const wantsCounts: Record<string, number> = {}
  const commentsCounts: Record<string, number> = {}
  
  wantsResult.data?.forEach(want => {
    wantsCounts[want.idea_id] = (wantsCounts[want.idea_id] || 0) + 1
  })
  
  commentsResult.data?.forEach(comment => {
    commentsCounts[comment.idea_id] = (commentsCounts[comment.idea_id] || 0) + 1
  })

  const userWants = userWantsResult.data?.map(want => want.idea_id) || []

  let ideasWithCounts = ideas?.map(idea => ({
    ...idea,
    user: Array.isArray(idea.user) ? idea.user[0] : idea.user,
    wants_count: wantsCounts[idea.id] || 0,
    comments_count: commentsCounts[idea.id] || 0,
    user_has_wanted: userWants.includes(idea.id),
  }) as HomePageIdea) || []

  if (sortBy === 'wants') {
    ideasWithCounts.sort((a, b) => b.wants_count - a.wants_count)
  } else if (sortBy === 'comments') {
    ideasWithCounts.sort((a, b) => b.comments_count - a.comments_count)
  } else if (sortBy === 'new') {
    ideasWithCounts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ProductHunt風ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">💡 アイデアボード</h1>
              
              {/* タブ */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/home?sort=wants"
                  className={`text-sm font-medium transition-colors pb-1 ${
                    sortBy === 'wants' 
                      ? 'text-orange-600 border-b-2 border-orange-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  人気
                </Link>
                <Link
                  href="/home?sort=new"
                  className={`text-sm font-medium transition-colors pb-1 ${
                    sortBy === 'new' 
                      ? 'text-orange-600 border-b-2 border-orange-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  新着
                </Link>
                <Link
                  href="/home?sort=comments"
                  className={`text-sm font-medium transition-colors pb-1 ${
                    sortBy === 'comments' 
                      ? 'text-orange-600 border-b-2 border-orange-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  話題
                </Link>
              </nav>
            </div>

            {/* 右側のアクション */}
            <div className="flex items-center space-x-4">
              {/* 検索 */}
              <form method="GET" className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search}
                  className="pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-64"
                  placeholder="アイデアを検索..."
                />
              </form>

              {/* 投稿ボタン */}
              <Link
                href="/ideas/new"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                アイデアを投稿
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* メインコンテンツ */}
          <div className="flex-1">
            {/* 日付フィルタ */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {searchParams.date === 'today' ? '今日のアイデア' : 
                   searchParams.date === 'week' ? '今週のアイデア' : 
                   'すべてのアイデア'}
                </h2>
                <div className="flex items-center space-x-2">
                  <Link
                    href="/home"
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      !searchParams.date 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    すべて
                  </Link>
                  <Link
                    href="/home?date=today"
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      searchParams.date === 'today' 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    今日
                  </Link>
                  <Link
                    href="/home?date=week"
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      searchParams.date === 'week' 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    今週
                  </Link>
                </div>
              </div>
            </div>

            {/* アイデアリスト */}
            <div className="space-y-2">
              {ideasWithCounts.length > 0 ? (
                ideasWithCounts.map((idea, index) => (
                  <ProductHuntIdeaItem key={idea.id} idea={idea} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">アイデアが見つかりませんでした</p>
                    <p className="text-sm mt-2">最初のアイデアを投稿してみましょう！</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* サイドバー */}
          <div className="hidden lg:block w-80 space-y-6">
            {/* カテゴリフィルタ */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                <Filter className="w-4 h-4 inline mr-1" />
                カテゴリ
              </h3>
              <div className="space-y-2">
                <Link
                  href="/home"
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    !searchParams.category
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  すべてのカテゴリ
                </Link>
                {CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={`/home?category=${encodeURIComponent(category)}`}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      searchParams.category === category
                        ? 'bg-orange-100 text-orange-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            {/* 収益化の説明 */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                💰 収益化の仕組み
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                投稿したアイデアが実現されると、アプリ収益の30%があなたに還元されます。
              </p>
              <Link
                href="/ideas/new"
                className="block w-full text-center bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                アイデアを投稿する
              </Link>
            </div>

            {/* ガイドライン */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                📝 投稿のヒント
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>具体的な問題を解決するアイデアが人気</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>ターゲットユーザーを明確に</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>実現可能性を考慮しよう</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
