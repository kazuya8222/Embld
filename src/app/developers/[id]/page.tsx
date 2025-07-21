import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Star,
  Trophy,
  Code2,
  Heart,
  MessageSquare,
  Rocket,
  TrendingUp,
  Award
} from 'lucide-react'

export default async function DeveloperProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // 開発者情報を取得
  const { data: developer, error: devError } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single()

  if (devError || !developer) {
    notFound()
  }

  // 開発者のアプリを取得
  const { data: apps } = await supabase
    .from('completed_apps')
    .select(`
      *,
      idea:ideas(
        id,
        title,
        category,
        wants(count),
        comments(count)
      ),
      reviews(rating)
    `)
    .eq('developer_id', params.id)
    .order('created_at', { ascending: false })

  // 開発者の統計情報を計算
  const totalApps = apps?.length || 0
  const totalReviews = apps?.reduce((sum, app) => sum + (app.reviews?.length || 0), 0) || 0
  const averageRating = totalReviews > 0
    ? apps?.reduce((sum, app) => {
        const appAvg = app.reviews?.length > 0
          ? app.reviews.reduce((s: number, r: any) => s + r.rating, 0) / app.reviews.length
          : 0
        return sum + appAvg * app.reviews?.length
      }, 0) / totalReviews
    : 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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

      {/* 開発者プロフィール */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-purple-700" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {developer.username}
                {developer.is_developer && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    <Trophy className="w-4 h-4" />
                    認定開発者
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>登録日: {formatDate(developer.created_at)}</span>
                </div>
              </div>
            </div>
            
            {/* 統計情報 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Rocket className="w-5 h-5 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-900">{totalApps}</div>
                </div>
                <div className="text-sm text-blue-700">開発アプリ</div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                  </div>
                </div>
                <div className="text-sm text-yellow-700">平均評価</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div className="text-2xl font-bold text-green-900">{totalReviews}</div>
                </div>
                <div className="text-sm text-green-700">レビュー数</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 開発したアプリ一覧 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Code2 className="w-6 h-6 text-purple-600" />
          開発したアプリ
        </h2>
        
        {apps && apps.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {apps.map((app: any) => {
              const appRating = app.reviews?.length > 0
                ? app.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / app.reviews.length
                : 0
              const wantCount = app.idea?.wants?.[0]?.count || 0
              const commentCount = app.idea?.comments?.[0]?.count || 0
              
              return (
                <Link
                  key={app.id}
                  href={`/apps/${app.id}`}
                  className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-purple-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {app.idea?.category || 'その他'}
                      </span>
                      {appRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{appRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900">
                      {app.app_name}
                    </h3>
                    
                    {app.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {app.description}
                      </p>
                    )}
                    
                    <div className="bg-gray-50 p-3 rounded text-xs">
                      <div className="text-gray-700 mb-1">
                        元アイデア: {app.idea?.title || '不明'}
                      </div>
                      <div className="flex items-center gap-3 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span>{wantCount}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-blue-500" />
                          <span>{commentCount}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        リリース: {formatDate(app.created_at)}
                      </span>
                      <span className="text-xs text-purple-600 font-medium">
                        詳細を見る →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">まだアプリを開発していません</p>
          </div>
        )}
      </div>

      {/* 開発者へのメッセージ */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 text-center space-y-4 border border-purple-100">
        <Award className="w-12 h-12 text-purple-600 mx-auto" />
        <h3 className="text-xl font-semibold text-purple-900">
          開発者をサポート
        </h3>
        <p className="text-purple-700 max-w-2xl mx-auto">
          優れたアプリを開発している開発者をサポートしましょう。
          レビューを書いたり、SNSでシェアすることで開発者のモチベーション向上につながります。
        </p>
      </div>
    </div>
  )
}