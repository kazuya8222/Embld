'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getStripe } from '@/lib/stripe/client'
import { cn } from '@/lib/utils/cn'
import { 
  Star, 
  Check, 
  Users, 
  BarChart3, 
  Eye, 
  CreditCard,
  ArrowRight,
  Crown
} from 'lucide-react'

export default function PremiumPage() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
      })
      
      const { url, error } = await response.json()
      
      if (error) {
        console.error('Error:', error)
        return
      }
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })
      
      const { url, error } = await response.json()
      
      if (error) {
        console.error('Error:', error)
        return
      }
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setPortalLoading(false)
  }

  const features = [
    {
      icon: Users,
      title: '「欲しい！」ユーザーリスト',
      description: 'アイデアに「欲しい！」したユーザーの詳細プロフィールを確認できます',
      free: false,
      premium: true,
    },
    {
      icon: BarChart3,
      title: '詳細分析データ',
      description: '「欲しい！」数とコメント数の推移グラフを確認できます',
      free: false,
      premium: true,
    },
    {
      icon: Eye,
      title: 'ユーザー属性分析',
      description: 'あなたのアイデアに関心を持つユーザーの属性を分析できます',
      free: false,
      premium: true,
    },
    {
      icon: Crown,
      title: 'プレミアムバッジ',
      description: 'プロフィールにプレミアムユーザーのバッジが表示されます',
      free: false,
      premium: true,
    },
  ]

  const basicFeatures = [
    'アイデアの投稿・閲覧',
    '「欲しい！」ボタン',
    'コメント機能',
    '基本的な統計情報',
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">プレミアムプラン</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          詳細な分析データでアイデアの需要をより深く理解しましょう
        </p>
      </div>

      {userProfile?.is_premium && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            <span className="text-lg font-semibold text-yellow-800">
              プレミアムユーザー
            </span>
          </div>
          <p className="text-yellow-700 mb-4">
            ありがとうございます！プレミアム機能をお楽しみください。
          </p>
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className={cn(
              "bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors",
              portalLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {portalLoading ? '処理中...' : 'サブスクリプション管理'}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">ベーシック</h2>
            <div className="text-4xl font-bold text-gray-900">
              ¥0
              <span className="text-lg font-normal text-gray-600">/月</span>
            </div>
            <p className="text-gray-600">基本機能を無料でご利用いただけます</p>
          </div>

          <div className="mt-8 space-y-4">
            {basicFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-md text-center font-medium">
              現在のプラン
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-300 p-8 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              おすすめ
            </span>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">プレミアム</h2>
            <div className="text-4xl font-bold text-gray-900">
              ¥500
              <span className="text-lg font-normal text-gray-600">/月</span>
            </div>
            <p className="text-gray-600">詳細分析でアイデアを成功に導く</p>
          </div>

          <div className="mt-8 space-y-4">
            {basicFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <feature.icon className="w-5 h-5 text-yellow-600" />
                <span className="text-gray-700 font-medium">{feature.title}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            {userProfile?.is_premium ? (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className={cn(
                  "w-full bg-yellow-600 text-white py-3 px-6 rounded-md hover:bg-yellow-700 transition-colors font-medium",
                  portalLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {portalLoading ? '処理中...' : 'サブスクリプション管理'}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className={cn(
                  "w-full bg-yellow-600 text-white py-3 px-6 rounded-md hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? (
                  '処理中...'
                ) : (
                  <>
                    プレミアムにアップグレード
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          プレミアム機能の詳細
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          よくある質問
        </h2>
        <div className="space-y-4 text-left max-w-2xl mx-auto">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              Q. いつでも解約できますか？
            </h3>
            <p className="text-gray-600 text-sm">
              A. はい、いつでも解約可能です。解約後も現在の請求期間の終了まで機能をご利用いただけます。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              Q. 支払い方法は何がありますか？
            </h3>
            <p className="text-gray-600 text-sm">
              A. クレジットカード（Visa、Mastercard、American Express）をご利用いただけます。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              Q. 無料プランに戻ることはできますか？
            </h3>
            <p className="text-gray-600 text-sm">
              A. はい、いつでも無料プランに戻ることができます。基本機能は引き続きご利用いただけます。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}