import Link from 'next/link'
import { CheckCircle, Star, ArrowRight } from 'lucide-react'

export default function PremiumSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          プレミアムプランへようこそ！
        </h1>
        
        <p className="text-lg text-gray-600">
          ありがとうございます。プレミアム機能をお楽しみください。
        </p>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="w-6 h-6 text-yellow-600" />
          <span className="text-lg font-semibold text-yellow-800">
            プレミアム機能が利用可能になりました
          </span>
        </div>
        
        <div className="space-y-2 text-sm text-yellow-700">
          <p>✓ 「欲しい！」ユーザーリストの確認</p>
          <p>✓ 詳細分析データの閲覧</p>
          <p>✓ ユーザー属性分析</p>
          <p>✓ プレミアムバッジの表示</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          さっそくアイデアの詳細分析を確認してみませんか？
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/ideas"
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            アイデア一覧を見る
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            href="/profile"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            マイページ
          </Link>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>
          サブスクリプションの管理は
          <Link href="/premium" className="text-primary-600 hover:text-primary-700 underline">
            プレミアムページ
          </Link>
          から行えます。
        </p>
      </div>
    </div>
  )
}