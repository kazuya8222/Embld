'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
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
  MessageSquare,
  Home,
  Package,
  Shield,
  Lightbulb
} from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const { user, userProfile, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()


  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
    setIsMenuOpen(false)
    
    try {
      await signOut()
    } catch (error) {
      console.error('Navigation: Logout error:', error)
      router.push('/auth/login')
    }
  }

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div className="flex items-center">
              <Link href="/home" className="flex items-center space-x-3">
                <img 
                  src="/images/EnBld_logo_icon_monochrome.svg"
                  alt="EMBLD Icon"
                  className="h-10 w-10 brightness-0 invert"
                />
                <span className="text-2xl font-black text-white">EMBLD</span>
              </Link>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/home"
                className={`flex items-center gap-2 pb-1 border-b-2 transition-all font-medium ${
                  pathname === '/home' || pathname === '/'
                    ? 'text-white border-white'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                ホーム
              </Link>
              <Link
                href="/owners"
                className={`flex items-center gap-2 pb-1 border-b-2 transition-all font-medium ${
                  pathname.startsWith('/owners')
                    ? 'text-white border-white'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                プロダクトを探す
              </Link>
            </nav>

            {/* 右側のアクション */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* 通知アイコン */}
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                  </button>
                  
                  {/* メッセージアイコン */}
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                    <MessageSquare className="h-5 w-5" />
                  </button>

                  {/* アイデア投稿ボタン */}
                  <Link
                    href="/ideas/new"
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                    アイデア投稿
                  </Link>

                  {/* ユーザーメニュー */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                        {(userProfile?.avatar_url || userProfile?.google_avatar_url) ? (
                          <img
                            src={userProfile.avatar_url || userProfile.google_avatar_url}
                            alt={userProfile.username || 'User'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Avatar image failed to load:', userProfile)
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <User className={cn("h-5 w-5 text-gray-400", (userProfile?.avatar_url || userProfile?.google_avatar_url) && "hidden")} />
                      </div>
                      <span className="hidden lg:block">
                        {userProfile?.username || (user?.email ? user.email.split('@')[0] : 'Guest')}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* ドロップダウンメニュー */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="inline h-4 w-4 mr-2" />
                          マイページ
                        </Link>
                        <Link
                          href="/profile/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          設定
                        </Link>
                        {userProfile?.is_admin && (
                          <>
                            <hr className="my-1" />
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-medium"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Shield className="inline h-4 w-4 mr-2" />
                              管理者画面
                            </Link>
                          </>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="inline h-4 w-4 mr-2" />
                          ログアウト
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* 通知アイコン（未ログイン時は非表示） */}
                  <button className="p-2 text-gray-400 opacity-50 cursor-not-allowed rounded-full">
                    <Bell className="h-5 w-5" />
                  </button>
                  
                  {/* メッセージアイコン（未ログイン時は非表示） */}
                  <button className="p-2 text-gray-400 opacity-50 cursor-not-allowed rounded-full">
                    <MessageSquare className="h-5 w-5" />
                  </button>

                  {/* アイデア投稿ボタン（未ログイン時はログイン画面に遷移） */}
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                    アイデア投稿
                  </Link>

                  {/* ログインボタン（アカウント名の場所） */}
                  <div className="relative">
                    <Link
                      href="/auth/login"
                      className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                        <LogIn className="h-5 w-5" />
                      </div>
                      <span className="hidden lg:block">ログイン</span>
                      <ChevronDown className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* モバイルメニューボタン */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/home"
                className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="inline h-4 w-4 mr-2" />
                ホーム
              </Link>
              <Link
                href="/owners"
                className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Grid3X3 className="inline h-4 w-4 mr-2" />
                プロダクトを探す
              </Link>
              {user ? (
                <>
                  <Link
                    href="/ideas/new"
                    className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="inline h-4 w-4 mr-2" />
                    アイデア投稿
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="inline h-4 w-4 mr-2" />
                    マイページ
                  </Link>
                  {userProfile?.is_admin && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-base font-medium text-red-400 hover:text-red-200 hover:bg-gray-800 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="inline h-4 w-4 mr-2" />
                      管理者画面
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                  >
                    <LogOut className="inline h-4 w-4 mr-2" />
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/ideas/new"
                    className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="inline h-4 w-4 mr-2" />
                    アイデア投稿
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="inline h-4 w-4 mr-2" />
                    マイページ
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="inline h-4 w-4 mr-2" />
                    ログイン
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}