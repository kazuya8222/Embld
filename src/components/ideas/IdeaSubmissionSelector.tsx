'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bot, PenTool, Lightbulb, ArrowRight, Sparkles, MessageSquare } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export function IdeaSubmissionSelector() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // ローディング中は何も表示しない（避免布局转换）
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 認証されていない場合も何も表示しない（リダイレクト処理中）
  if (!user) {
    return null
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">アイデア投稿</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            あなたのアイデアを
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              カタチ
            </span>
            にしよう
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            どちらの方法でアイデアを投稿しますか？あなたに最適な方法を選んでください。
          </p>
        </div>

        {/* 選択肢 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* AIチャット */}
          <Link href="/ideas/new/chat" className="group">
            <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 overflow-hidden">
              {/* 軽量化された背景装飾 */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-400 rounded-full opacity-10"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-400 rounded-full opacity-5"></div>
              
              <div className="relative z-10">
                {/* アイコン */}
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>

                {/* タイトル */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  AIとチャットして投稿
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </h3>

                {/* 説明 */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  AIがあなたとの対話を通じて、アイデアを整理・発展させます。
                  初心者でも簡単にプロフェッショナルなアイデアを作成できます。
                </p>

                {/* 特徴 */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>対話形式で簡単入力</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>AIがアイデアを整理・発展</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>初心者におすすめ</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">おすすめ</span>
                  <div className="flex items-center gap-2 text-blue-600">
                    <span className="font-medium">始める</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* 手動投稿 */}
          <Link href="/ideas/new/manual" className="group">
            <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 overflow-hidden">
              {/* 軽量化された背景装飾 */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-400 rounded-full opacity-10"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-green-400 rounded-full opacity-5"></div>
              
              <div className="relative z-10">
                {/* アイコン */}
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <PenTool className="w-8 h-8 text-white" />
                </div>

                {/* タイトル */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  自分で詳細を記入
                </h3>

                {/* 説明 */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  既に明確なアイデアがある場合は、フォームに直接記入して投稿できます。
                  詳細まで自分でコントロールしたい方におすすめです。
                </p>

                {/* 特徴 */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <PenTool className="w-4 h-4 text-emerald-500" />
                    <span>詳細な項目を自由に入力</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Lightbulb className="w-4 h-4 text-teal-500" />
                    <span>明確なアイデア向け</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>上級者向け</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600">手動入力</span>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <span className="font-medium">始める</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* フッター */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            どちらを選んでも、後から編集・修正できます
          </p>
        </div>
      </div>
    </div>
  )
}