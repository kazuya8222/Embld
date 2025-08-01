'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { cn } from '@/lib/utils/cn'
import { 
  User, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Plus,
  Grid3X3,
  ChevronDown,
  Bell,
  MessageSquare
} from 'lucide-react'

export function Navigation() {
  const { user, userProfile, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // デバッグ用
  useEffect(() => {
    console.log('Navigation - Auth state:', { user: user?.email, userProfile })
  }, [user, userProfile])

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMenuOpen(false)
    } catch (error) {
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link href="/home" className="flex items-center space-x-3">
              <img 
                src="/images/EnBld_logo_icon_monochrome.svg"
                alt="EMBLD Icon"
                className="h-10 w-10"
              />
              <span className="text-2xl font-black text-gray-900">EMBLD</span>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/home"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ホーム
            </Link>
            <Link
              href="/apps"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              完成アプリ
            </Link>
          </nav>

          {/* 右側のアクション */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* 通知アイコン */}
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                
                {/* メッセージアイコン */}
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </button>

                {/* アイデア投稿ボタン */}
                <Link
                  href="/ideas/new"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2.5 rounded-full font-bold hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  アイデア投稿
                </Link>

                {/* ユーザーメニュー */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">{userProfile?.username || 'ユーザー'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        マイページ
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        設定
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/ideas/new"
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg transition-all"
                >
                  アイデアを投稿する
                </Link>
              </>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/home"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            <Link
              href="/apps"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              完成アプリ
            </Link>
            
            {user ? (
              <>
                <hr className="my-2 border-gray-100" />
                <Link
                  href="/ideas/new"
                  className="block w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-3 rounded-full font-bold text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  アイデア投稿
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  マイページ
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <hr className="my-2 border-gray-100" />
                <Link
                  href="/auth/login"
                  className="block w-full text-center px-4 py-2 text-gray-600 font-medium mb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/ideas/new"
                  className="block w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-3 rounded-full font-bold text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  アイデアを投稿する
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}