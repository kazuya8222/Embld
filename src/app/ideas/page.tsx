import { createServerClient } from '@/lib/supabase/server'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { CATEGORIES } from '@/types'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'

interface SearchParams {
  category?: string
  status?: string
  search?: string
  sort?: string
}

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  let query = supabase
    .from('ideas')
    .select(`
      *,
      user:users(username, avatar_url),
      wants(id, user_id),
      comments(id)
    `)

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,problem.ilike.%${searchParams.search}%`)
  }

  // Always order by created_at for now, we'll sort on the client side
  query = query.order('created_at', { ascending: false })

  const { data: ideas, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return <div>アイデアの取得に失敗しました</div>
  }

  const ideasWithCounts = ideas?.map(idea => ({
    ...idea,
    wants_count: idea.wants?.length || 0,
    comments_count: idea.comments?.length || 0,
    user_has_wanted: session ? idea.wants?.some((want: any) => want.user_id === session.user.id) || false : false,
  })) || []

  // Sort on the client side based on user preference
  const sortBy = searchParams.sort || 'created_at'
  if (sortBy === 'wants') {
    ideasWithCounts.sort((a, b) => b.wants_count - a.wants_count)
  } else if (sortBy === 'comments') {
    ideasWithCounts.sort((a, b) => b.comments_count - a.comments_count)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">アイデア一覧</h1>
          <p className="text-gray-600 mt-1">みんなの「こんなアプリが欲しい」を探してみよう</p>
        </div>
        <Link
          href="/ideas/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新しいアイデア
        </Link>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">フィルター・検索</span>
        </div>
        
        <form method="GET" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                キーワード検索
              </label>
              <input
                type="text"
                id="search"
                name="search"
                defaultValue={searchParams.search}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="タイトルや問題から検索"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <select
                id="category"
                name="category"
                defaultValue={searchParams.category || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">すべてのカテゴリ</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                id="status"
                name="status"
                defaultValue={searchParams.status || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">すべてのステータス</option>
                <option value="open">募集中</option>
                <option value="in_development">開発中</option>
                <option value="completed">完成</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                並び順
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={searchParams.sort || 'created_at'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="created_at">新着順</option>
                <option value="wants">「欲しい！」の多い順</option>
                <option value="comments">コメントの多い順</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              検索・フィルター
            </button>
            <Link
              href="/ideas"
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              リセット
            </Link>
          </div>
        </form>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideasWithCounts.length > 0 ? (
          ideasWithCounts.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
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
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
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