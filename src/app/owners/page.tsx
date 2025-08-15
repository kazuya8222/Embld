import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { OwnersHeader } from '@/components/owners/OwnersHeader';
import { OwnersCategoryFilter } from '@/components/owners/OwnersCategoryFilter';
import { MainPostGrid } from '@/components/owners/MainPostGrid';
import { OwnersTodaySection } from '@/components/owners/OwnersTodaySection';
import { OwnersTrendingSection } from '@/components/owners/OwnersTrendingSection';
import { OwnersFeaturedSection } from '@/components/owners/OwnersFeaturedSection';

interface SearchParams {
  category?: string;
  search?: string;
  sort?: 'latest' | 'popular' | 'trending';
}

export default async function OwnersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // ユーザープロファイル情報を取得
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('id, username, avatar_url, google_avatar_url')
      .eq('id', user.id)
      .single();
    userProfile = profile;
  }

  // Get categories
  const { data: categories } = await supabase
    .from('owner_categories')
    .select('*')
    .order('post_count', { ascending: false });

  // Build query for posts
  let postsQuery = supabase
    .from('owner_posts')
    .select(`
      *,
      user:users(id, username, avatar_url),
      likes:owner_post_likes(count),
      comments:owner_post_comments(count)
    `)
    .eq('status', 'published');

  // Apply category filter
  if (searchParams.category && searchParams.category !== 'all') {
    const category = categories?.find(c => c.slug === searchParams.category);
    if (category) {
      postsQuery = postsQuery.eq('category', category.name);
    }
  }

  // Apply search filter
  if (searchParams.search) {
    postsQuery = postsQuery.or(
      `title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`
    );
  }

  // Apply sorting
  switch (searchParams.sort) {
    case 'popular':
      postsQuery = postsQuery.order('like_count', { ascending: false });
      break;
    case 'trending':
      postsQuery = postsQuery.order('view_count', { ascending: false });
      break;
    default:
      postsQuery = postsQuery.order('created_at', { ascending: false });
  }

  const { data: posts } = await postsQuery.limit(30);

  // Get today's posts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: todaysPosts } = await supabase
    .from('owner_posts')
    .select(`
      *,
      user:users(id, username, avatar_url)
    `)
    .eq('status', 'published')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  // Get featured posts
  const { data: featuredPosts } = await supabase
    .from('owner_posts')
    .select(`
      *,
      user:users(id, username, avatar_url),
      likes:owner_post_likes(count)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3);

  // Get trending posts (most viewed in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: trendingPosts } = await supabase
    .from('owner_posts')
    .select(`
      *,
      user:users(id, username, avatar_url),
      likes:owner_post_likes(count)
    `)
    .eq('status', 'published')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('view_count', { ascending: false })
    .limit(6);

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <OwnersHeader user={user} userProfile={userProfile} />
      
      {/* Today's Launches */}
      {todaysPosts && todaysPosts.length > 0 && (
        <OwnersTodaySection posts={todaysPosts} />
      )}

      {/* Featured Section */}
      {featuredPosts && featuredPosts.length > 0 && (
        <OwnersFeaturedSection posts={featuredPosts} />
      )}

      {/* プロジェクト投稿を促すCTAセクション */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 border border-gray-200 rounded-lg p-8">
            <div className="flex items-center justify-between">
              {/* 左側：テキスト */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">あなたのプロジェクトも世界に発信しよう</h2>
                <p className="text-gray-600">個人開発アプリを投稿して、フィードバックやユーザーを獲得しましょう</p>
              </div>
              {/* 右側：ボタン */}
              <div>
                {user ? (
                  <Link
                    href="/owners/new"
                    className="px-6 py-3 text-base font-bold bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                  >
                    プロジェクトを投稿する
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="px-6 py-3 text-base font-bold bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                  >
                    ログインして投稿
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* プロジェクト掲示板セクション */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">プロジェクト掲示板</h2>
          <div className="flex gap-8">
            {/* メインコンテンツ */}
            <div className="flex-1">
              {/* Trending Section */}
              {!searchParams.category && !searchParams.search && trendingPosts && trendingPosts.length > 0 && (
                <div className="mb-12">
                  <OwnersTrendingSection posts={trendingPosts} />
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-6">
                  {searchParams.category && searchParams.category !== 'all' 
                    ? categories?.find(c => c.slug === searchParams.category)?.name 
                    : searchParams.search 
                    ? `「${searchParams.search}」の検索結果`
                    : '最新のプロジェクト'}
                </h3>
                
                <Suspense fallback={
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                }>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts && posts.length > 0 ? (
                      posts.map((post) => (
                        <Link key={post.id} href={`/owners/${post.id}`} className="group block h-full">
                          <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
                            {/* サムネイル画像 */}
                            <div className="w-full h-48 relative">
                              {post.images && post.images.length > 0 ? (
                                <img
                                  src={post.images[0]}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                  <span className="text-4xl">📱</span>
                                </div>
                              )}
                              {/* カテゴリラベル */}
                              <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                                {post.category}
                              </span>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                              <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[3rem]">
                                {post.title}
                              </h3>
                              <p className="text-gray-600 text-sm mt-2 line-clamp-2 min-h-[2.5rem]">
                                {post.description}
                              </p>
                              <div className="flex items-center justify-between mt-auto pt-4">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>👁 {post.view_count}</span>
                                  <span>❤️ {post.like_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <img
                                    src={post.user?.avatar_url || '/default-avatar.png'}
                                    alt={post.user?.username || 'User'}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span className="text-xs text-gray-500">{post.user?.username}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">まだプロジェクトがありません</p>
                      </div>
                    )}
                  </div>
                </Suspense>
              </div>
            </div>

            {/* 右サイドバー */}
            <aside className="w-64 flex-shrink-0">
              {/* 検索バー */}
              <div className="mb-6">
                <form method="GET">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="search"
                      defaultValue={searchParams.search}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                      placeholder="プロジェクトを検索"
                    />
                  </div>
                </form>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/owners"
                  className={`flex items-center justify-between px-4 py-2 text-sm rounded-md transition-colors ${
                    !searchParams.category
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  すべて
                  <ChevronRight className="w-4 h-4" />
                </Link>
                {categories?.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/owners?category=${encodeURIComponent(category.slug)}`}
                    className={`flex items-center justify-between px-4 py-2 text-sm rounded-md transition-colors ${
                      searchParams.category === category.slug
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}