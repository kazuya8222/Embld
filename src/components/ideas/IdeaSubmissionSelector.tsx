'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bot, FileText, ArrowRight } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export function IdeaSubmissionSelector() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 認証されていない場合も何も表示しない（リダイレクト処理中）
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            企画書を作成する
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AIエージェントによる要件定義、または手動での入力を選択できます。
          </p>
        </div>

        {/* 選択肢 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* AIエージェント */}
          <div 
            className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
            onClick={() => router.push('/ideas/new/workflow')}
          >
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              AIエージェントと要件定義
            </h3>

            <p className="text-gray-600 mb-6 leading-relaxed">
              専門的なAIエージェントが対話を通じて、あなたのアイデアを
              体系的に整理し、プロフェッショナルな要件定義書を作成します。
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-600">推奨</span>
              <div className="flex items-center gap-2 text-blue-600">
                <span className="font-medium">開始する</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 手動入力 */}
          <div 
            className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
            onClick={() => router.push('/ideas/new/manual')}
          >
            <div className="w-16 h-16 bg-gray-500 rounded-lg flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              手動で入力
            </h3>

            <p className="text-gray-600 mb-6 leading-relaxed">
              既に明確なアイデアがある場合は、フォームに直接記入して
              投稿できます。詳細まで自分でコントロールしたい方向けです。
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">上級者向け</span>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">開始する</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}