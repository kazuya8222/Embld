import { createClient } from '@/utils/supabase/server'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { CATEGORIES } from '@/types'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Search, TrendingUp, Sparkles } from 'lucide-react'

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
  
  // 認証状態を確認
  const { data: { session } } = await supabase.auth.getSession()
  
  // ログインしていない場合はログインページへリダイレクト
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
      {/* シンプルなヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              アイデアを探す
            </h1>
            <p className="text-gray-600">
              実現を待っているアイデアや、開発中のプロジェクトを見つけよう
            </p>
          </div>
          <Link
            href="/ideas/new"
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            アイデアを投稿
          </Link>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{ideasWithCounts.length}</p>
            <p className="text-sm text-gray-600">投稿されたアイデア</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary-600">20%</p>
            <p className="text-sm text-gray-600">収益還元率</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {ideasWithCounts.filter(idea => idea.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600">実現したアプリ</p>
          </div>
        </div>
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
                最初のアイデアを投稿して、開発者とマッチングしましょう
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

      {/* プレミアムへの誘導 */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              <Sparkles className="w-5 h-5 inline text-yellow-500 mr-1" />
              プレミアムプランでもっと詳しく
            </h3>
            <p className="text-sm text-gray-600">
              アイデアの詳細分析や需要予測データを確認できます
            </p>
          </div>
          <Link
            href="/premium"
            className="btn btn-primary text-sm"
          >
            詳細を見る
          </Link>
        </div>
      </div>
    </div>
  )
}