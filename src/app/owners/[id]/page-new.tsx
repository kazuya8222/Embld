import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { OwnersHeader } from '@/components/owners/OwnersHeader';
import { BackButton } from '@/components/owners/BackButton';
import { incrementViewCount } from '@/app/actions/ownerPosts';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, UserPlus, User as UserIcon, Bookmark } from 'lucide-react';
import { FollowButton } from '@/components/owners/FollowButton';
import { LikeButton } from '@/components/owners/LikeButton';
import { SaveButton } from '@/components/owners/SaveButton';
import { ShareButton } from '@/components/owners/ShareButton';

interface PageProps {
  params: { id: string };
}

export default async function OwnerPostPage({ params }: PageProps) {
  const supabase = await createClient();
  
  const { data: post, error } = await supabase
    .from('owner_posts')
    .select(`
      *,
      user:users(id, username, avatar_url),
      likes:owner_post_likes(user_id),
      comments:owner_post_comments(
        id,
        content,
        created_at,
        user:users(id, username, avatar_url),
        parent_id
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !post) {
    notFound();
  }

  // Increment view count
  await incrementViewCount(params.id);

  // Get follower count for post creator
  const { data: followers } = await supabase
    .from('owner_follows')
    .select('id')
    .eq('following_id', post.user.id);

  // Check if current user follows the post creator
  let isFollowing = false;

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  // ユーザープロファイル情報を取得
  let userProfile = null;
  if (currentUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('id, username, avatar_url, google_avatar_url')
      .eq('id', currentUser.id)
      .single();
    userProfile = profile;
    
    // Check if user follows the post creator
    if (currentUser.id !== post.user.id) {
      const { data: followData } = await supabase
        .from('owner_follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', post.user.id)
        .single();
      
      isFollowing = !!followData;
    }
  }

  // Check if current user liked this post
  const isLiked = currentUser ? post.likes?.some((like: any) => like.user_id === currentUser.id) : false;

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnersHeader user={currentUser} userProfile={userProfile} />
      
      {/* メインコンテンツエリア */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* トップページに戻るボタン */}
        <BackButton />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：アプリ概要・作成者紹介文・コメント */}
          <div className="space-y-6">
            {/* アプリ概要 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center relative">
                {post.images && post.images.length > 0 ? (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-6xl">📱</div>
                )}
                {/* 公開/非公開ステータス */}
                <div className="absolute top-4 left-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    公開
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
                <p className="text-gray-600 mb-6">{post.description}</p>
                
                {/* アクションボタン */}
                <div className="flex items-center gap-3 mb-6">
                  {post.project_url && (
                    <a
                      href={post.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      🚀 使う
                    </a>
                  )}
                  <SaveButton postId={post.id} currentUser={currentUser} />
                  <LikeButton 
                    postId={post.id}
                    isLiked={isLiked}
                    likeCount={post.like_count}
                    currentUser={currentUser}
                  />
                  <ShareButton postUrl={`${process.env.NEXT_PUBLIC_APP_URL}/owners/${post.id}`} />
                </div>

                {/* 詳細説明 */}
                {post.content && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 作成者のアプリ紹介文 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 作成者からのメッセージ</h3>
              <div className="flex items-start gap-3">
                <img
                  src={post.user?.avatar_url || '/default-avatar.png'}
                  alt={post.user?.username || 'User'}
                  className="w-10 h-10 rounded-full"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{post.user?.username}</span>
                    <span className="text-sm text-gray-500">2024年3月15日</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      このプロジェクトを作成した理由は、日々の作業でこのようなツールが必要だと感じたからです。特にユーザーエクスペリエンスとパフォーマンスにこだわって開発しました。みなさんのフィードバックをお待ちしています！
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* コメントセクション */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">💬 コメント ({post.comments?.length || 0})</h3>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  新しい順
                </button>
              </div>
              
              {/* コメント入力 */}
              {currentUser ? (
                <div className="mb-6">
                  <div className="flex gap-3">
                    <img
                      src={userProfile?.avatar_url || '/default-avatar.png'}
                      alt={userProfile?.username || 'User'}
                      className="w-8 h-8 rounded-full"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <textarea
                        placeholder="コメントを書く..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">Ctrl + Enter で投稿</span>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                          コメントする
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 mb-2">コメントするにはログインが必要です</p>
                  <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-medium">
                    ログインする
                  </Link>
                </div>
              )}
              
              {/* コメント一覧 */}
              <div className="space-y-4">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.user?.avatar_url || '/default-avatar.png'}
                        alt={comment.user?.username || 'User'}
                        className="w-8 h-8 rounded-full"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.user?.username}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                            ❤️ いいね
                          </button>
                          <button className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                            返信
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">まだコメントがありません</p>
                    <p className="text-sm text-gray-400 mt-1">最初のコメントを書いてみませんか？</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右側：プロフィール・プロジェクト詳細・おすすめ */}
          <div className="space-y-6">
            {/* プロフィールコンポーネント */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Link 
                    href={`/owners/profile/${post.user?.username || post.user?.id}`}
                    className="block"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                      {post.user?.avatar_url ? (
                        <img 
                          src={post.user.avatar_url} 
                          alt={post.user.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        post.user?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link 
                      href={`/owners/profile/${post.user?.username || post.user?.id}`}
                      className="font-bold text-lg text-gray-900 hover:underline"
                    >
                      {post.user?.username || 'Anonymous'}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {followers?.length || 0} フォロワー
                    </p>
                  </div>
                </div>
              </div>
              
              {/* アクションボタン */}
              <div className="space-y-3">
                {currentUser?.id !== post.user.id && (
                  <>
                    <FollowButton 
                      userId={post.user.id}
                      isFollowing={isFollowing}
                      currentUser={currentUser}
                    />
                    <Link
                      href={`/owners/profile/${post.user?.username || post.user?.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      プロフィールを見る
                    </Link>
                  </>
                )}
                {currentUser?.id === post.user.id && (
                  <Link
                    href="/owners/profile/edit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    プロフィールを編集
                  </Link>
                )}
              </div>
            </div>

            {/* プロジェクト詳細情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">プロジェクト詳細</h3>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">カテゴリ</dt>
                  <dd className="mt-1">
                    <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                      {post.category}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">料金モデル</dt>
                  <dd className="mt-1 text-gray-900">{post.pricing_model === 'free' ? '無料' : post.pricing_model}</dd>
                </div>

                {post.platform && post.platform.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">プラットフォーム</dt>
                    <dd className="mt-1">
                      <div className="flex flex-wrap gap-1">
                        {post.platform.map((platform: string, index: number) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}

                {post.tech_stack && post.tech_stack.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">技術スタック</dt>
                    <dd className="mt-1">
                      <div className="flex flex-wrap gap-1">
                        {post.tech_stack.map((tech: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* おすすめアプリ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 おすすめアプリ</h3>
              <div className="space-y-4">
                {/* おすすめアプリカード */}
                <Link href="/owners/sample-1" className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                      📊
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">Analytics Dashboard</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">リアルタイムデータ分析ツール</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">ビジネス</span>
                        <span className="text-xs text-gray-500">❤️ 142</span>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/owners/sample-2" className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                      🎨
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">Color Palette Generator</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">AIでカラーパレットを生成</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">グラフィック/デザイン</span>
                        <span className="text-xs text-gray-500">❤️ 89</span>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/owners/sample-3" className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-xl">
                      📱
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">Habit Tracker</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">習慣を簡単に記録・管理</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">ライフスタイル</span>
                        <span className="text-xs text-gray-500">❤️ 267</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Link href="/owners" className="text-purple-600 text-sm font-medium hover:text-purple-700">
                  もっと見る →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}