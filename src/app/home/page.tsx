import { createClient } from '@/utils/supabase/server'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { CATEGORIES } from '@/types'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Search, TrendingUp, Sparkles, DollarSign, Zap, PiggyBank } from 'lucide-react'

interface SearchParams {
  category?: string
  status?: string
  search?: string
  sort?: string
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
    .limit(20)

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,problem.ilike.%${searchParams.search}%`)
  }

  const sortBy = searchParams.sort || 'created_at'
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
  }

  return (
    <div className="space-y-6">
      {/* 収益化ヘッダー */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl shadow-sm border border-primary-200 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              あなたのアイデアを収益化しよう
            </h1>
            <p className="text-lg text-gray-700">
              投稿したアイデアが実現されれば、アプリ収益の<span className="font-bold text-primary-600">20%</span>があなたのものに
            </p>
          </div>

          {/* 収益化のポイント */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">継続的な収入</h3>
              <p className="text-sm text-gray-600">
                アプリが使われ続ける限り、毎月収益が振り込まれます
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">リスクゼロ</h3>
              <p className="text-sm text-gray-600">
                開発費用は一切不要。アイデアを投稿するだけでOK
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <PiggyBank className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">収益予測</h3>
              <p className="text-sm text-gray-600">
                人気アプリなら月10万円以上の収益も夢じゃない
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              今すぐアイデアを投稿して収益化
            </Link>
            <p className="text-sm text-gray-600 mt-3">
              ※ 投稿は完全無料。クレジットカード不要
            </p>
          </div>
        </div>
      </div>

      {/* アイデア一覧ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          投稿されたアイデア
        </h2>
        <p className="text-gray-600">
          どんなアイデアが投稿されているか見てみよう
        </p>
      </div>

      {/* 検索・フィルタ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <form method="GET" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search}
                className="form-input pl-10 w-full"
                placeholder="キーワードで検索..."
              />
            </div>
            
            <select
              name="sort"
              defaultValue={searchParams.sort || 'created_at'}
              className="form-input"
            >
              <option value="created_at">新着順</option>
              <option value="wants">人気順</option>
              <option value="comments">コメント順</option>
            </select>
            
            <button
              type="submit"
              className="btn btn-primary"
            >
              検索
            </button>
          </div>
          
          {/* カテゴリフィルタ */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/home"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !searchParams.category
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              すべて
            </Link>
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/home?category=${encodeURIComponent(category)}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  searchParams.category === category
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </Link>
            ))}
          </div>
        </form>
      </div>

      {/* アイデア一覧 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideasWithCounts.length > 0 ? (
          ideasWithCounts.map((idea) => (
            <IdeaCard key={idea.id} idea={idea as any} />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchParams.category || searchParams.search
                  ? '条件に一致するアイデアが見つかりませんでした'
                  : 'まだアイデアが投稿されていません'}
              </h3>
              <p className="text-gray-600 mb-6">
                最初のアイデアを投稿して、収益化のチャンスを掴もう
              </p>
              <Link
                href="/ideas/new"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                アイデアを投稿する
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 収益化促進バナー */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-300 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          💡 アイデアはありませんか？
        </h3>
        <p className="text-gray-700 mb-4">
          日常の「こんなアプリがあったら便利なのに」という思いが、収益を生む可能性があります
        </p>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          アイデアを投稿
        </Link>
      </div>
    </div>
  )
}