'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Rocket, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

interface OwnersHeroProps {
  user: User | null;
  searchParams: any;
}

export function OwnersHero({ user, searchParams }: OwnersHeroProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/owners?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/owners');
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 mr-2 text-yellow-300" />
            <h1 className="text-5xl font-bold">Owners</h1>
            <Sparkles className="w-8 h-8 ml-2 text-yellow-300" />
          </div>
          
          <p className="text-xl mb-2 opacity-90">
            個人開発者のためのプロジェクト共有プラットフォーム
          </p>
          <p className="text-lg mb-8 opacity-80">
            毎日新しいアプリが生まれる場所
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="アプリ名、カテゴリ、技術スタックで検索..."
                className="w-full px-6 py-4 pr-12 text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Link
                href="/owners/new"
                className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <Rocket className="w-5 h-5 mr-2" />
                プロジェクトを投稿
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <Rocket className="w-5 h-5 mr-2" />
                ログインして投稿
              </Link>
            )}
            
            <Link
              href="/owners?sort=trending"
              className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur text-white font-semibold rounded-full hover:bg-opacity-30 transition-all"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              トレンドを見る
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold">1,234+</div>
              <div className="text-sm opacity-80">プロジェクト</div>
            </div>
            <div>
              <div className="text-3xl font-bold">567+</div>
              <div className="text-sm opacity-80">開発者</div>
            </div>
            <div>
              <div className="text-3xl font-bold">89</div>
              <div className="text-sm opacity-80">今週の新着</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}