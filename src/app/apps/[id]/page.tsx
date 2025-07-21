import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { ReviewSection } from '@/components/apps/ReviewSection'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  ExternalLink,
  Globe,
  Smartphone,
  Star,
  Lightbulb,
  Trophy,
  Code2,
  Sparkles
} from 'lucide-react'

export default async function AppDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: app, error } = await supabase
    .from('completed_apps')
    .select(`
      *,
      idea:ideas(
        id,
        title,
        problem,
        solution,
        category,
        tags,
        user:users(username)
      ),
      developer:users(username, avatar_url, google_avatar_url, is_developer),
      reviews(
        *,
        user:users(username, avatar_url, google_avatar_url)
      )
    `)
    .eq('id', params.id)
    .single()
  
  // 開発者の他のアプリを取得
  const { data: developerApps } = await supabase
    .from('completed_apps')
    .select(`
      id,
      app_name,
      reviews(rating)
    `)
    .eq('developer_id', app?.developer_id)
    .neq('id', params.id)
    .limit(3)

  if (error || !app) {
    notFound()
  }

  const reviews = app.reviews || []
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/apps"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          アプリ一覧に戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {app.idea.category}
            </span>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              完成
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {app.app_name}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>開発者: {app.developer.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>リリース: {formatDate(app.created_at)}</span>
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(averageRating)}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length} レビュー)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {app.description && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">アプリについて</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {app.description}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">
                元のアイデア: {app.idea.title}
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">解決したい問題</h3>
                  <p className="text-gray-600 text-sm">{app.idea.problem}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">解決策</h3>
                  <p className="text-gray-600 text-sm">{app.idea.solution}</p>
                </div>
                <div className="text-sm text-gray-500">
                  アイデア投稿者: {app.idea.user.username}
                </div>
                <Link
                  href={`/ideas/${app.idea.id}`}
                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm"
                >
                  <Lightbulb className="w-4 h-4" />
                  元のアイデアを見る
                </Link>
              </div>
            </div>

            {app.idea.tags && app.idea.tags.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">タグ</h2>
                <div className="flex flex-wrap gap-2">
                  {app.idea.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">アプリにアクセス</h2>
              
              <div className="space-y-3">
                {app.app_url && (
                  <a
                    href={app.app_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">ウェブアプリ</div>
                      <div className="text-sm text-gray-600">ブラウザで開く</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                )}

                {app.store_urls?.ios && (
                  <a
                    href={app.store_urls.ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">App Store</div>
                      <div className="text-sm text-gray-600">iOS版をダウンロード</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                )}

                {app.store_urls?.android && (
                  <a
                    href={app.store_urls.android}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Google Play</div>
                      <div className="text-sm text-gray-600">Android版をダウンロード</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                  </a>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">アプリ情報</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">開発者</span>
                  <span className="font-medium">{app.developer.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">リリース日</span>
                  <span className="font-medium">{formatDate(app.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">レビュー数</span>
                  <span className="font-medium">{reviews.length}</span>
                </div>
                {reviews.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均評価</span>
                    <span className="font-medium">{averageRating.toFixed(1)} / 5.0</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 開発者プロフィール */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 space-y-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">開発者プロフィール</h3>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{app.developer.username}</div>
                  {app.developer.is_developer && (
                    <div className="flex items-center gap-1 text-xs text-purple-600">
                      <Trophy className="w-3 h-3" />
                      <span>認定開発者</span>
                    </div>
                  )}
                </div>
              </div>
              
              {developerApps && developerApps.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span>他の開発アプリ</span>
                  </div>
                  <div className="space-y-2">
                    {developerApps.map((devApp: any) => {
                      const avgRating = devApp.reviews?.length > 0
                        ? devApp.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / devApp.reviews.length
                        : 0
                      
                      return (
                        <Link
                          key={devApp.id}
                          href={`/apps/${devApp.id}`}
                          className="block p-2 bg-white bg-opacity-60 rounded border border-purple-100 hover:border-purple-200 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{devApp.app_name}</span>
                            {avgRating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600">{avgRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <Link
                href={`/developers/${app.developer_id}`}
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
              >
                開発者ページへ
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <ReviewSection
          appId={app.id}
          initialReviews={reviews}
        />
      </div>
    </div>
  )
}