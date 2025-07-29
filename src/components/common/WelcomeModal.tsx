'use client'

import { useState, useEffect } from 'react'
import { X, Lightbulb, Users, Code, Rocket } from 'lucide-react'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // 初回訪問チェック
    const hasVisited = localStorage.getItem('enblt-visited')
    if (!hasVisited) {
      setIsOpen(true)
      localStorage.setItem('enblt-visited', 'true')
    }
  }, [])

  const closeModal = () => {
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 p-6 rounded-t-xl text-white">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-10 h-10" />
            <h1 className="text-2xl font-bold">Enbltへようこそ！</h1>
          </div>
          
          <p className="text-lg text-teal-100">
            「こんなアプリ欲しい！」を現実にするプラットフォーム
          </p>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* サービスの流れ */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 サービスの流れ</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">1. アイデア投稿</h3>
                <p className="text-sm text-gray-600">「こんなアプリ欲しい！」を投稿</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Code className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">2. 開発者が実現</h3>
                <p className="text-sm text-gray-600">開発者がアイデアを選んで開発</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Rocket className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">3. みんなで利用</h3>
                <p className="text-sm text-gray-600">完成したアプリを利用開始</p>
              </div>
            </div>
          </div>

          {/* 特典システム */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎁 お得な特典システム</h2>
            <div className="space-y-3">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-1">💡 アイデア投稿者</h3>
                <p className="text-sm text-yellow-700">あなたのアイデアが実現すれば<strong>永久無料</strong>で利用可能！</p>
              </div>
              
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <h3 className="font-semibold text-teal-800 mb-1">❤️ 「ほしい！」した人</h3>
                <p className="text-sm text-teal-700">支持したアイデアが実現すれば<strong>割引対象</strong>に！</p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-1">💻 開発者</h3>
                <p className="text-sm text-green-700"><strong>アイデア & マーケティング効果</strong>を同時に獲得！</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4 border-t">
            <button
              onClick={closeModal}
              className="bg-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-400 transition-colors"
            >
              アイデアを探してみる
            </button>
            <p className="text-xs text-gray-500 mt-2">このメッセージは初回のみ表示されます</p>
          </div>
        </div>
      </div>
    </div>
  )
}