'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'

export default function CookiesPage() {
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true, // Always true and disabled
    analytics: false,
    marketing: false,
    preferences: false
  })

  useEffect(() => {
    // Load saved cookie preferences
    const saved = localStorage.getItem('cookiePreferences')
    if (saved) {
      const preferences = JSON.parse(saved)
      setCookieSettings(prev => ({ ...prev, ...preferences }))
    }
  }, [])

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookieSettings))
    alert('Cookie設定を保存しました。')
  }

  const handleAcceptAll = () => {
    const newSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }
    setCookieSettings(newSettings)
    localStorage.setItem('cookiePreferences', JSON.stringify(newSettings))
    alert('すべてのCookieを許可しました。')
  }

  const handleRejectOptional = () => {
    const newSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    }
    setCookieSettings(newSettings)
    localStorage.setItem('cookiePreferences', JSON.stringify(newSettings))
    alert('必要なCookie以外を拒否しました。')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Cookieを管理
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-8">
              EMBLDでは、サービスの提供と改善のためにCookieを使用しています。
              以下から各カテゴリのCookieの使用を管理できます。
            </p>

            <div className="space-y-6">
              {/* 必須Cookie */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    必須Cookie
                  </h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={cookieSettings.necessary}
                      disabled
                      className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded opacity-50 cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-500">常に有効</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  これらのCookieは、ウェブサイトの基本機能を提供するために必要です。
                  ログイン状態の維持、セキュリティ、基本的なサイト機能に使用されます。
                </p>
              </div>

              {/* 解析Cookie */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    解析Cookie
                  </h3>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cookieSettings.analytics}
                      onChange={(e) => setCookieSettings(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">許可する</span>
                  </label>
                </div>
                <p className="text-gray-600 text-sm">
                  サイトの利用状況を分析し、ユーザーエクスペリエンスを向上させるために使用されます。
                  Google Analyticsなどのサービスが含まれます。
                </p>
              </div>

              {/* マーケティングCookie */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    マーケティングCookie
                  </h3>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cookieSettings.marketing}
                      onChange={(e) => setCookieSettings(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">許可する</span>
                  </label>
                </div>
                <p className="text-gray-600 text-sm">
                  パーソナライズされた広告の表示や、広告の効果測定のために使用されます。
                  第三者の広告ネットワークとの連携が含まれる場合があります。
                </p>
              </div>

              {/* 設定Cookie */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    設定Cookie
                  </h3>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cookieSettings.preferences}
                      onChange={(e) => setCookieSettings(prev => ({ ...prev, preferences: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">許可する</span>
                  </label>
                </div>
                <p className="text-gray-600 text-sm">
                  ユーザーの設定や選択を記憶し、よりパーソナライズされたエクスペリエンスを提供するために使用されます。
                  言語設定、テーマ設定などが含まれます。
                </p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={handleSavePreferences}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                設定を保存
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                すべて許可
              </button>
              <button
                onClick={handleRejectOptional}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                必須以外を拒否
              </button>
            </div>

            {/* 詳細情報 */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Cookieについて
              </h2>
              
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Cookieとは
              </h3>
              <p className="text-gray-600 mb-4">
                Cookieは、ウェブサイトがユーザーのコンピュータに保存する小さなテキストファイルです。
                これらのファイルは、サイトの機能を向上させ、よりパーソナライズされたエクスペリエンスを提供するために使用されます。
              </p>

              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Cookieの管理方法
              </h3>
              <p className="text-gray-600 mb-4">
                ブラウザの設定からCookieを削除したり、将来のCookieをブロックしたりできます。
                ただし、これによりサイトの一部機能が正常に動作しなくなる場合があります。
              </p>

              <h3 className="text-lg font-medium text-gray-700 mb-2">
                第三者Cookie
              </h3>
              <p className="text-gray-600 mb-4">
                当サイトでは、Google Analytics、広告パートナーなどの第三者サービスによるCookieも使用される場合があります。
                これらのCookieは、各事業者のプライバシーポリシーに従って管理されます。
              </p>

              <h3 className="text-lg font-medium text-gray-700 mb-2">
                お問い合わせ
              </h3>
              <p className="text-gray-600 mb-4">
                Cookieの使用に関してご質問がございましたら、お問い合わせフォームよりご連絡ください。
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 mt-8">
              <p className="text-sm text-gray-600">
                最終更新日: 2025年8月23日
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}