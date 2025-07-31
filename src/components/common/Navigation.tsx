'use client'

import { useState } from 'react'
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
  Crown,
  ChevronDown,
  Bell,
  MessageSquare
} from 'lucide-react'

export function Navigation() {
  const { user, userProfile, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMenuOpen(false)
    } catch (error) {
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link href="/home" className="flex items-center space-x-3">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Grid3X3 className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Embld</span>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/home"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              案件を探す
            </Link>
            <Link
              href="/apps"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              完成アプリ
            </Link>
            <Link
              href="/premium"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-1"
            >
              <Crown className="h-4 w-4 text-yellow-500" />
              プレミアム
            </Link>
          </nav>

          {/* 右側のアクション */}
          <div className="hidden md:flex items-center space-x-3">
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
                  className="btn btn-primary flex items-center gap-2"
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
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium">{userProfile?.username || 'ユーザー'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        マイページ
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        設定
                      </Link>
                      <hr className="my-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                  className="btn btn-secondary"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/register"
                  className="btn btn-primary"
                >
                  新規登録
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
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            <Link
            href="/home"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
            onClick={() => setIsMenuOpen(false)}
            >
            案件を探す
            </Link>
            <Link
              href="/apps"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              完成アプリ
            </Link>
            <Link
              href="/premium"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Crown className="h-4 w-4 text-yellow-500" />
              プレミアム
            </Link>
            
            {user ? (
              <>
                <hr className="my-2 border-gray-200" />
                <Link
                  href="/ideas/new"
                  className="block w-full btn btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  アイデア投稿
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  マイページ
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <hr className="my-2 border-gray-200" />
                <Link
                  href="/auth/login"
                  className="block w-full btn btn-secondary text-center mb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full btn btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}