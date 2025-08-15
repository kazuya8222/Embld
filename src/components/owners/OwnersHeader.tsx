'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User as UserIcon, ChevronDown, LogOut, Settings, Home, Lightbulb, Bell, MessageSquare, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

interface OwnersHeaderProps {
  user: User | null;
  userProfile?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    google_avatar_url: string | null;
  } | null;
}

export function OwnersHeader({ user, userProfile }: OwnersHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/owners?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/owners');
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link href="/owners" className="flex items-center space-x-3">
              <img 
                src="/images/EnBld_logo_icon_monochrome.svg"
                alt="EMBLD Icon"
                className="h-10 w-10 brightness-0 invert"
              />
              <div className="flex flex-col">
                <span className="text-xl font-black text-white leading-none">EMBLD</span>
                <span className="text-xs text-purple-400 leading-none">for owners</span>
              </div>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/owners"
              className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-gray-400 hover:text-white transition-all font-medium"
            >
              <Home className="w-4 h-4" />
              ホーム
            </Link>
            <Link
              href="/home"
              className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-gray-400 hover:text-white transition-all font-medium"
            >
              <Lightbulb className="w-4 h-4" />
              アイデアを探す
            </Link>
          </nav>

          {/* 検索バー */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="プロジェクトを検索..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </form>
          </div>

          {/* 右側のアクション */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* 通知・メッセージアイコン */}
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </button>

                {/* ユーザーメニュー */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden">
                      {(userProfile?.avatar_url || userProfile?.google_avatar_url) ? (
                        <img
                          src={userProfile.avatar_url || userProfile.google_avatar_url || ''}
                          alt={userProfile.username || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <span className={`text-white text-sm font-semibold ${(userProfile?.avatar_url || userProfile?.google_avatar_url) ? 'hidden' : ''}`}>
                        {userProfile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden lg:block">
                      {userProfile?.username || user?.email?.split('@')[0] || 'Guest'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* ドロップダウンメニュー */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                      <Link
                        href={`/owners/profile/${user.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserIcon className="inline h-4 w-4 mr-2" />
                        マイページ
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="inline h-4 w-4 mr-2" />
                        設定
                      </Link>
                      <hr className="my-1" />
                      <Link
                        href="/home"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Lightbulb className="inline h-4 w-4 mr-2" />
                        アイデアを探す
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          // ログアウト処理
                        }}
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
                <button className="p-2 text-gray-400 opacity-50 cursor-not-allowed rounded-full">
                  <Bell className="h-5 w-5" />
                </button>
                
                <button className="p-2 text-gray-400 opacity-50 cursor-not-allowed rounded-full">
                  <MessageSquare className="h-5 w-5" />
                </button>

                <Link
                  href="/auth/login"
                  className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors"
                >
                  ログイン
                </Link>
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
            {/* モバイル検索 */}
            <div className="px-3 py-2">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="プロジェクトを検索..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
              </form>
            </div>

            <Link
              href="/owners"
              className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="inline h-4 w-4 mr-2" />
              ホーム
            </Link>
            
            <Link
              href="/home"
              className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Lightbulb className="inline h-4 w-4 mr-2" />
              アイデアを探す
            </Link>

            {user ? (
              <>
                <Link
                  href={`/owners/profile/${user.id}`}
                  className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserIcon className="inline h-4 w-4 mr-2" />
                  マイページ
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                >
                  <LogOut className="inline h-4 w-4 mr-2" />
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}