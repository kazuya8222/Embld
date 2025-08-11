'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { MessageCircle, Search, Lightbulb, Users, ChevronRight, DollarSign } from 'lucide-react'
import { PostIdeaButton } from '@/components/common/PostIdeaButton'
import { CATEGORIES } from '@/types'

interface HomePageIdea {
  id: string
  title: string
  problem: string
  category: string
  status: string
  created_at: string
  tags?: string[]
  sketch_urls?: string[]
  revenue?: number
  user: {
    username: string
    avatar_url?: string
  }
  wants_count: number
  comments_count: number
  user_has_wanted: boolean
}

interface HomePageClientProps {
  ideasWithCounts: HomePageIdea[]
  searchParams: {
    category?: string
    search?: string
  }
}

export default function HomePageClient({ ideasWithCounts, searchParams }: HomePageClientProps) {
  // useMemo で計算結果をキャッシュ（レンダリング最適化）
  const { topRevenueIdeas, latestIdeas } = useMemo(() => {
    return {
      topRevenueIdeas: ideasWithCounts
        .filter(idea => (idea.revenue || 0) > 0)
        .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 4),
      latestIdeas: ideasWithCounts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 9) // 3x3グリッド
    }
  }, [ideasWithCounts])

  return (
    <div className="bg-gray-50">
      {/* プロジェクト開発事例 */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">プロジェクト開発事例</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRevenueIdeas.length > 0 ? (
              topRevenueIdeas.map((idea) => (
                <Link key={idea.id} href={`/ideas/${idea.id}`} className="group block h-full">
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
                    {/* サムネイル画像 */}
                    <div className="w-full h-48 relative">
                      {idea.sketch_urls && idea.sketch_urls.length > 0 ? (
                        <img
                          src={idea.sketch_urls[0]}
                          alt={idea.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {/* フォールバック用のプレースホルダー */}
                      <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 absolute inset-0 flex items-center justify-center ${idea.sketch_urls && idea.sketch_urls.length > 0 ? 'hidden' : ''}`}>
                        <Lightbulb className="w-16 h-16 text-white opacity-50" />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3rem]">
                        {idea.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 min-h-[1.5rem]">
                        {idea.category}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {idea.wants_count}人
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {idea.comments_count}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {idea.revenue}円
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">まだ開発事例がありません</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* アイデア投稿を促すCTAセクション */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-8">
            <div className="flex items-center justify-between">
              {/* 左側：テキスト */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">あなたもアイデアで収益化しよう</h2>
              </div>
              {/* 右側：ボタン */}
              <div>
                <PostIdeaButton className="px-6 py-3 text-base font-bold bg-orange-600 text-white hover:bg-orange-700 rounded-lg shadow-sm">
                  アイデアを投稿する
                </PostIdeaButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* アイデア掲示板セクション */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">アイデア掲示板</h2>
          <div className="flex gap-8">
            {/* メインコンテンツ */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestIdeas.length > 0 ? (
                  latestIdeas.map((idea) => (
                    <Link key={idea.id} href={`/ideas/${idea.id}`} className="group block h-full">
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
                        {/* サムネイル画像 */}
                        <div className="w-full h-40 relative">
                          {idea.sketch_urls && idea.sketch_urls.length > 0 ? (
                            <img
                              src={idea.sketch_urls[0]}
                              alt={idea.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          {/* フォールバック用のプレースホルダー */}
                          <div className={`w-full h-full bg-gradient-to-br from-green-400 to-blue-500 absolute inset-0 flex items-center justify-center ${idea.sketch_urls && idea.sketch_urls.length > 0 ? 'hidden' : ''}`}>
                            <Lightbulb className="w-12 h-12 text-white opacity-50" />
                          </div>
                          {/* カテゴリラベル */}
                          <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                            {idea.category}
                          </span>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3rem]">
                            {idea.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2 min-h-[2.5rem]">
                            {idea.problem}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{idea.wants_count}%</span>
                              <span>{idea.wants_count}人</span>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              {idea.revenue}円
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.min(idea.wants_count * 10, 100)}%`}} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">まだアイデアがありません</p>
                  </div>
                )}
              </div>
              
              {ideasWithCounts.length > 6 && (
                <div className="text-center mt-8">
                  <Link
                    href="/home/all"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    もっと見る
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* 右サイドバー */}
            <aside className="w-64 flex-shrink-0">
              {/* 検索バー */}
              <div className="mb-6">
                <form method="GET">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="search"
                      defaultValue={searchParams.search}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      placeholder="キーワードで検索"
                    />
                  </div>
                </form>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/home"
                  className={`flex items-center justify-between px-4 py-2 text-sm rounded-md transition-colors ${
                    !searchParams.category
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  すべて
                  <ChevronRight className="w-4 h-4" />
                </Link>
                {CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={`/home?category=${encodeURIComponent(category)}`}
                    className={`flex items-center justify-between px-4 py-2 text-sm rounded-md transition-colors ${
                      searchParams.category === category
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}