'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { cn } from '@/lib/utils/cn'
import { 
  Lightbulb, 
  User, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Star,
  Plus,
  Smartphone
} from 'lucide-react'

export function Navigation() {
  const { user, userProfile, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMenuOpen(false)
    } catch (error) {
      console.error('ログアウトに失敗しました:', error)
      // エラーが発生してもメニューを閉じる
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Lightbulb className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">IdeaSpark</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/ideas"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              アイデア一覧
            </Link>
            <Link
              href="/apps"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              完成アプリ
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/ideas/new"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  アイデア投稿
                </Link>
                
                {!userProfile?.is_premium && (
                  <Link
                    href="/premium"
                    className="text-yellow-600 hover:text-yellow-700 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Star className="h-4 w-4" />
                    プレミアム
                  </Link>
                )}
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{userProfile?.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      マイページ
                    </Link>
                    <Link
                      href="/profile/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      設定
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      ログアウト
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Link
              href="/ideas"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              アイデア一覧
            </Link>
            <Link
              href="/apps"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              完成アプリ
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/ideas/new"
                  className="block px-3 py-2 text-primary-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  アイデア投稿
                </Link>
                {!userProfile?.is_premium && (
                  <Link
                    href="/premium"
                    className="block px-3 py-2 text-yellow-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    プレミアム
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  マイページ
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors cursor-pointer"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-primary-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}