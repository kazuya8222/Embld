import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Search, TrendingUp, Users, Clock } from 'lucide-react';
import { OwnersHeader } from '@/components/owners/OwnersHeader';
import { OwnersCategoryFilter } from '@/components/owners/OwnersCategoryFilter';
import { MainPostGrid } from '@/components/owners/MainPostGrid';
import { OwnersTodaySection } from '@/components/owners/OwnersTodaySection';
import { OwnersTrendingSection } from '@/components/owners/OwnersTrendingSection';
import { OwnersFeaturedSection } from '@/components/owners/OwnersFeaturedSection';

interface SearchParams {
  category?: string;
  search?: string;
  tab?: 'latest' | 'following' | 'trending';
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

  // Apply tab filtering
  switch (searchParams.tab) {
    case 'following':
      // フォロー中のユーザーの投稿を取得
      if (user) {
        const { data: followingUsers } = await supabase
          .from('owner_follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        if (followingUsers && followingUsers.length > 0) {
          const followingIds = followingUsers.map(f => f.following_id);
          postsQuery = postsQuery.in('user_id', followingIds);
        }
      }
      postsQuery = postsQuery.order('created_at', { ascending: false });
      break;
    case 'trending':
      postsQuery = postsQuery.order('view_count', { ascending: false });
      break;
    default:
      postsQuery = postsQuery.order('created_at', { ascending: false });
      break;
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
      
      {/* 検索バーとカテゴリ、タブセクション */}
      <section className="bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* 検索タイトル */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-medium text-gray-300">個人開発プロダクトを検索</h2>
          </div>

          {/* 検索バー */}
          <div className="flex justify-center mb-6">
            <form method="GET" className="w-full max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="Search..."
                  className="w-full pl-12 pr-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  ⌘ + K
                </button>
              </div>
            </form>
          </div>

          {/* カテゴリタグ */}
          <div className="flex justify-center mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/owners"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !searchParams.category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                すべて
              </Link>
              {categories?.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  href={`/owners?category=${encodeURIComponent(category.slug)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    searchParams.category === category.slug
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* プロダクト一覧 */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* タブボタン */}
          <div className="flex justify-center mb-8">
            <div className="relative bg-gray-100 rounded-full p-1">
              <div className="flex">
                {/* スライドインジケーター */}
                <div className={`absolute inset-1 w-1/3 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                  searchParams.tab === 'following' 
                    ? 'translate-x-full' 
                    : searchParams.tab === 'trending'
                    ? 'translate-x-[200%]'
                    : 'translate-x-0'
                }`}></div>
                
                <Link
                  href={`/owners${searchParams.category ? `?category=${searchParams.category}` : ''}`}
                  scroll={false}
                  className={`relative z-10 flex items-center justify-center gap-2 w-32 py-2 rounded-full text-sm font-medium transition-colors ${
                    !searchParams.tab || searchParams.tab === 'latest'
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  最新
                </Link>
                <Link
                  href={`/owners?tab=following${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                  scroll={false}
                  className={`relative z-10 flex items-center justify-center gap-2 w-32 py-2 rounded-full text-sm font-medium transition-colors ${
                    searchParams.tab === 'following'
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  フォロー中
                </Link>
                <Link
                  href={`/owners?tab=trending${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                  scroll={false}
                  className={`relative z-10 flex items-center justify-center gap-2 w-32 py-2 rounded-full text-sm font-medium transition-colors ${
                    searchParams.tab === 'trending'
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  トレンド
                </Link>
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-6 text-gray-900">
            {searchParams.search 
              ? `「${searchParams.search}」の検索結果`
              : searchParams.tab === 'following'
              ? 'フォロー開発者のプロダクト'
              : searchParams.tab === 'trending'
              ? 'トレンドのプロダクト'
              : '最新のプロダクト'}
          </h3>
          
          <Suspense fallback={
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col animate-pulse">
                  <div className="w-full h-80 bg-gray-200"></div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <Link key={post.id} href={`/owners/${post.id}`} className="group block h-full">
                          <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col transform hover:scale-[1.02]">
                            {/* サムネイル画像 */}
                            <div className="w-full h-80 relative">
                              {post.images && post.images.length > 0 ? (
                                <img
                                  src={post.images[0]}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  decoding="async"
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
                              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[2.5rem] mb-2">
                                {post.title}
                              </h3>
                              <p className="text-gray-600 mt-1 line-clamp-2 min-h-[3rem]">
                                {post.description}
                              </p>
                              <div className="flex items-center justify-between mt-auto pt-4">
                                <div className="flex items-center gap-4 text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {post.view_count}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {post.like_count}
                                  </span>
                                </div>
                                <Link 
                                  href={`/owners/profile/${post.user?.username || post.user?.id}`}
                                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                  <img
                                    src={post.user?.avatar_url || '/default-avatar.png'}
                                    alt={post.user?.username || 'User'}
                                    className="w-8 h-8 rounded-full"
                                    loading="lazy"
                                  />
                                  <span className="text-sm font-medium text-gray-700 hover:text-purple-600">{post.user?.username}</span>
                                </Link>
                              </div>
                            </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    {searchParams.tab === 'following' 
                      ? 'フォローしている人の投稿がまだありません。他のユーザーをフォローしてみましょう！' 
                      : 'まだプロダクトがありません'}
                  </p>
                  {searchParams.tab === 'following' && (
                    <Link 
                      href="/owners"
                      className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      ユーザーを探す
                    </Link>
                  )}
                </div>
              )}
            </div>
          </Suspense>

          {/* EMBLDへのリンク - 控えめな配置 */}
          <div className="text-center mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">個人開発のアイデア探しに</p>
            <Link 
              href="/home"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-purple-600 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors"
            >
              💡 EMBLD でアイデアを見つける
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}