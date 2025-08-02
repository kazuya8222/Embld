'use client'

import Link from 'next/link'
import { ChevronUp, MessageCircle, Search, Filter, TrendingUp, Clock, Sparkles, DollarSign, Flame, Star, Lightbulb, ArrowRight } from 'lucide-react'
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
    search?: string
  }
}

export default function HomePageClient({ ideasWithCounts, searchParams }: HomePageClientProps) {
  // トップ収益のアイデア（仮のロジック - 実際は収益データが必要）
  const topRevenueIdeas = [...ideasWithCounts]
    .sort((a, b) => b.wants_count - a.wants_count)
    .slice(0, 3)

  // 注目のアイデア（Wants数とコメント数の合計でソート）
  const hotIdeas = [...ideasWithCounts]
    .sort((a, b) => {
      const scoreA = a.wants_count + a.comments_count
      const scoreB = b.wants_count + b.comments_count
      return scoreB - scoreA
    })
    .slice(0, 5)

  // 最新のアイデア
  const latestIdeas = [...ideasWithCounts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* アイデア投稿を促すバナー */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-8 h-8" />
            <h1 className="text-2xl font-bold">あなたのアイデアが収益に変わる</h1>
          </div>
          <p className="text-lg mb-6 text-white/90">
            アイデアを投稿して、実現されたアプリの収益の30%を受け取りましょう。<br />
            開発はEMBLDチームが担当。あなたはアイデアを考えるだけでOK！
          </p>
          <PostIdeaButton className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 border border-gray-200">
            <span>アイデアを投稿する</span>
            <ArrowRight className="w-5 h-5" />
          </PostIdeaButton>
        </div>

        <div className="flex gap-6">
          {/* メインコンテンツ */}
          <div className="flex-1 space-y-8">
            {/* トップ収益 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">トップ収益</h2>
              </div>
              <div className="space-y-2">
                {topRevenueIdeas.map((idea) => (
                  <ProductHuntIdeaItem key={idea.id} idea={idea} />
                ))}
              </div>
            </section>

            {/* 注目のアイデア */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">注目のアイデア</h2>
              </div>
              <div className="space-y-2">
                {hotIdeas.length > 0 ? (
                  hotIdeas.map((idea) => (
                    <ProductHuntIdeaItem key={idea.id} idea={idea} />
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">まだ注目のアイデアがありません</p>
                  </div>
                )}
              </div>
            </section>

            {/* 最新のアイデア */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">最新のアイデア</h2>
              </div>
              <div className="space-y-2">
                {latestIdeas.length > 0 ? (
                  latestIdeas.map((idea) => (
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
            </section>

            {/* すべてのアイデアを見る */}
            {ideasWithCounts.length > 13 && (
              <div className="text-center py-6">
                <Link
                  href="/home/all"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  すべてのアイデアを見る
                  <ChevronUp className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="hidden lg:block w-80 space-y-6">
            {/* 検索バー */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                <Search className="w-4 h-4 inline mr-1" />
                アイデアを検索
              </h3>
              <form method="GET">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchParams.search}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    placeholder="キーワードを入力..."
                  />
                </div>
              </form>
            </div>

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