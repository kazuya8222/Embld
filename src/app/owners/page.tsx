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
                  {category.icon} {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* タブボタン */}
          <div className="flex justify-center">
            <div className="inline-flex bg-gray-800 rounded-full p-1">
              <Link
                href={`/owners${searchParams.category ? `?category=${searchParams.category}` : ''}`}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  !searchParams.tab || searchParams.tab === 'latest'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                最新
              </Link>
              <Link
                href={`/owners?tab=following${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchParams.tab === 'following'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                フォロー中
              </Link>
              <Link
                href={`/owners?tab=trending${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchParams.tab === 'trending'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                トレンド
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* プロジェクト一覧 */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">
            {searchParams.search 
              ? `「${searchParams.search}」の検索結果`
              : searchParams.tab === 'following'
              ? 'フォロー中のプロジェクト'
              : searchParams.tab === 'trending'
              ? 'トレンドのプロジェクト'
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
                                <Link 
                                  href={`/owners/profile/${post.user?.username || post.user?.id}`}
                                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                                >
                                  <img
                                    src={post.user?.avatar_url || '/default-avatar.png'}
                                    alt={post.user?.username || 'User'}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span className="text-xs text-gray-500 hover:text-purple-600">{post.user?.username}</span>
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
                      : 'まだプロジェクトがありません'}
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
        </div>
      </section>
    </div>
  );
}