import { createClient } from '@/utils/supabase/server'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { CATEGORIES } from '@/types'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'

interface SearchParams {
  category?: string
  status?: string
  search?: string
  sort?: string
  author?: string
}

// ホームページ用の軽量なIdea型
interface HomePageIdea {
  id: string
  title: string
  problem: string
  category: string
  status: string
  created_at: string
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
  
  // パフォーマンス最適化: 必要最小限のデータのみ取得
  let query = supabase
    .from('ideas')
    .select(`
      id,
      title,
      problem,
      category,
      status,
      created_at,
      user:users(username, avatar_url)
    `)
    .limit(20) // 初期表示件数を制限

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,problem.ilike.%${searchParams.search}%`)
  }

  if (searchParams.author === 'me' && session?.user?.id) {
    query = query.eq('user_id', session.user.id)
  }

  // データベースレベルでソート処理
  const sortBy = searchParams.sort || 'created_at'
  query = query.order('created_at', { ascending: false })

  const { data: ideas, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return <div>アイデアの取得に失敗しました</div>
  }

  // wantsとcommentsの数を効率的に取得
  const ideaIds = ideas?.map(idea => idea.id) || []
  
  const [wantsResult, commentsResult, userWantsResult] = await Promise.all([
    // wants数を取得
    supabase
      .from('wants')
      .select('idea_id')
      .in('idea_id', ideaIds),
    
    // comments数を取得
    supabase
      .from('comments')
      .select('idea_id')
      .in('idea_id', ideaIds),
    
    // ユーザーのwant状態を取得
    session?.user?.id ? supabase
      .from('wants')
      .select('idea_id')
      .eq('user_id', session.user.id)
      .in('idea_id', ideaIds) : Promise.resolve({ data: [] })
  ])

  // カウントを集計
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

  // クライアントサイドソートを保持（パフォーマンスのため数が少ない場合のみ）
  if (sortBy === 'wants') {
    ideasWithCounts.sort((a, b) => b.wants_count - a.wants_count)
  } else if (sortBy === 'comments') {
    ideasWithCounts.sort((a, b) => b.comments_count - a.comments_count)
  }

  return (
    <div className="space-y-6">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-8 text-center text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
        <h1 className="text-3xl font-bold mb-3 relative z-10">「こんなアプリ欲しい！」を実現します</h1>
        <p className="text-lg text-teal-100 mb-6 relative z-10">あなたのアイデアをEmbldチームが開発。収益の20%をアイデア投稿者に還元！</p>
        <div className="flex justify-center items-center gap-4 text-sm relative z-10">
          <div className="flex items-center gap-1">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">{ideasWithCounts.length}個のアイデア</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">収益の20%還元</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">Embldが開発</span>
          </div>
        </div>
      </div>

      {/* カテゴリ一覧 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !searchParams.category
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全て
          </Link>
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/?category=${encodeURIComponent(category)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                searchParams.category === category
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* 検索・フィルタ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form method="GET" className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="キーワード検索"
            />
            
            <select
              name="status"
              defaultValue={searchParams.status || ''}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">全ステータス</option>
              <option value="open">募集中</option>
              <option value="in_development">開発中</option>
              <option value="completed">完成</option>
            </select>
            
            <select
              name="sort"
              defaultValue={searchParams.sort || 'created_at'}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="created_at">新着順</option>
              <option value="wants">ほしい順</option>
              <option value="comments">コメント順</option>
            </select>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-400 transition-colors text-sm"
              >
                検索
              </button>
              <Link
                href="/"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                リセット
              </Link>
            </div>
          </div>
          {/* 選択中のカテゴリを隠しフィールドで保持 */}
          {searchParams.category && (
            <input type="hidden" name="category" value={searchParams.category} />
          )}
          {searchParams.author && (
            <input type="hidden" name="author" value={searchParams.author} />
          )}
        </form>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideasWithCounts.length > 0 ? (
          ideasWithCounts.map((idea) => (
            <IdeaCard key={idea.id} idea={idea as any} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 mb-4">
              {searchParams.category || searchParams.status || searchParams.search
                ? '条件に一致するアイデアが見つかりませんでした'
                : 'まだアイデアが投稿されていません'}
            </p>
            <Link
              href="/ideas/new"
              className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-400 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              最初のアイデアを投稿
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}