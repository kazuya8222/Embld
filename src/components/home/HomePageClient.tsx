'use client'

import Link from 'next/link'
import { ChevronUp, MessageCircle, Search, Filter, TrendingUp, Clock, Sparkles } from 'lucide-react'
import { ProductHuntIdeaItem } from '@/components/ideas/ProductHuntIdeaItem'
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
    status?: string
    search?: string
    sort?: string
    date?: string
  }
}

export default function HomePageClient({ ideasWithCounts, searchParams }: HomePageClientProps) {
  const sortBy = searchParams.sort || 'wants'

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
              <PostIdeaButton className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors" />
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
              <PostIdeaButton className="block w-full text-center bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors" />
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