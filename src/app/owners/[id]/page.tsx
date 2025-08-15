import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { OwnersHeader } from '@/components/owners/OwnersHeader';
import { OwnerPostDetail } from '@/components/owners/OwnerPostDetail';
import { OwnerPostComments } from '@/components/owners/OwnerPostComments';
import { BackButton } from '@/components/owners/BackButton';
import { incrementViewCount } from '@/app/actions/ownerPosts';

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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnersHeader user={currentUser} userProfile={userProfile} />
      
      {/* メインコンテンツエリア */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* トップページに戻るボタン */}
        <BackButton />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：メイン画像エリア */}
          <div className="space-y-4">
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
            </div>

            {/* プロジェクト基本情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <p className="text-gray-600 mb-4">{post.description}</p>
              
              {/* プロジェクトURL */}
              {post.project_url && (
                <div className="mb-4">
                  <a
                    href={post.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    🚀 プロジェクトを見る
                  </a>
                </div>
              )}

              {/* 詳細説明 */}
              {post.content && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>
              )}
            </div>

          </div>

          {/* 右側：サイドバー情報 */}
          <div className="space-y-6">
            {/* AIによるサービス紹介改善表示 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AIによるサービス紹介改善表示</h3>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <p className="text-gray-700 text-sm">
                  AIがあなたのプロジェクトをより魅力的に紹介するための改善提案を表示します。
                </p>
                <button className="mt-3 text-purple-600 text-sm font-medium hover:text-purple-700">
                  改善提案を見る →
                </button>
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

                <div>
                  <dt className="text-sm font-medium text-gray-500">統計</dt>
                  <dd className="mt-1 text-gray-900">
                    <div className="flex gap-4 text-sm">
                      <span>👁 {post.view_count} views</span>
                      <span>❤️ {post.like_count} likes</span>
                    </div>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">作成者</dt>
                  <dd className="mt-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.user?.avatar_url || '/default-avatar.png'}
                        alt={post.user?.username || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-gray-900">{post.user?.username}</span>
                    </div>
                  </dd>
                </div>
              </div>
            </div>

            {/* EmBldユーザーからのコメント表示 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">EmBldユーザーからのコメント表示</h3>
              <div className="space-y-4">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.slice(0, 3).map((comment: any) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={comment.user?.avatar_url || '/default-avatar.png'}
                          alt={comment.user?.username || 'User'}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-700">{comment.user?.username}</span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">まだコメントがありません</p>
                )}
                
                <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                  すべてのコメントを見る →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}