import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { WantButton } from '@/components/common/WantButton'
import { CommentSection } from '@/components/common/CommentSection'
import Link from 'next/link'
import { 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  Edit, 
  ExternalLink,
  Target,
  AlertCircle,
  Lightbulb,
  Rocket,
  Star,
  Code,
  DollarSign,
  Smartphone,
  Globe,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
  Zap,
  FileText,
  Palette,
  Link as LinkIcon
} from 'lucide-react'
import { CoreFeature } from '@/types'

export default async function IdeaDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: idea, error } = await supabase
    .from('ideas')
    .select(`
      *,
      user:users(username, avatar_url, google_avatar_url),
      wants(user_id),
      comments(
        *,
        user:users(username, avatar_url, google_avatar_url)
      ),
      completed_apps(
        *,
        developer:users(username, avatar_url, google_avatar_url),
        reviews(rating)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !idea) {
    notFound()
  }

  const wantsCount = idea.wants?.length || 0
  const userHasWanted = session ? idea.wants?.some((want: any) => want.user_id === session.user.id) || false : false
  const comments = idea.comments || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isOwner = session?.user?.id === idea.user_id

  // 企画書フォーマットの項目が入力されているかチェック
  const hasProjectPlan = idea.service_name || idea.catch_copy || idea.service_description ||
    idea.background_problem || idea.main_target || idea.value_proposition ||
    idea.core_features?.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/home"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          アイデア一覧に戻る
        </Link>
        
        {isOwner && (
          <Link
            href={`/ideas/${idea.id}/edit`}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            編集
          </Link>
        )}
      </div>

      {/* ヘッダー情報 */}
      <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {idea.category}
              </span>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                idea.status === 'open' ? 'bg-green-100 text-green-700' :
                idea.status === 'in_development' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {idea.status === 'open' ? '募集中' :
                 idea.status === 'in_development' ? '開発中' : '完成'}
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {idea.service_name || idea.title}
          </h1>

          {idea.catch_copy && (
            <p className="text-xl text-gray-600 italic">
              &ldquo;{idea.catch_copy}&rdquo;
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{idea.user.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(idea.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <WantButton
                ideaId={idea.id}
                initialWanted={userHasWanted}
                initialCount={wantsCount}
                className="text-base px-6 py-3"
              />
            </div>
          </div>
        </div>
      </div>

      {hasProjectPlan ? (
        // 企画書フォーマット表示
        <div className="space-y-8">
          {/* 1. サービス概要 */}
          {(idea.service_description || idea.tags?.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-600" />
                サービス概要
              </h2>
              
              {idea.service_description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">サービスの説明</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.service_description}</p>
                </div>
              )}

              {idea.tags && idea.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">タグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.map((tag: string, index: number) => (
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
          )}

          {/* 2. 背景・課題 */}
          {(idea.background_problem || idea.current_solution_problems || idea.problem) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                背景・課題
              </h2>
              
              {(idea.background_problem || idea.problem) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">解決したい問題</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {idea.background_problem || idea.problem}
                  </p>
                </div>
              )}

              {idea.current_solution_problems && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">現状の解決方法とその問題点</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.current_solution_problems}</p>
                </div>
              )}
            </div>
          )}

          {/* 3. ターゲットユーザー */}
          {(idea.main_target || idea.usage_scene || idea.target_users) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                ターゲットユーザー
              </h2>
              
              {(idea.main_target || idea.target_users) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">メインターゲット</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {idea.main_target || idea.target_users}
                  </p>
                </div>
              )}

              {idea.usage_scene && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">想定利用シーン</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.usage_scene}</p>
                </div>
              )}
            </div>
          )}

          {/* 4. 提供価値 */}
          {(idea.value_proposition || idea.differentiators || idea.solution) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                提供価値
              </h2>
              
              {(idea.value_proposition || idea.solution) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">このサービスで実現したいこと</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {idea.value_proposition || idea.solution}
                  </p>
                </div>
              )}

              {idea.differentiators && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">既存サービスとの違い</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.differentiators}</p>
                </div>
              )}
            </div>
          )}

          {/* 5. 主要機能 */}
          {(idea.core_features?.length > 0 || idea.nice_to_have_features) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-600" />
                主要機能
              </h2>
              
              {idea.core_features && idea.core_features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-4">核となる機能</h3>
                  <div className="space-y-4">
                    {(idea.core_features as CoreFeature[]).map((feature, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {index + 1}. {feature.title}
                        </h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {idea.nice_to_have_features && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">あったらいいなと思う機能</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.nice_to_have_features}</p>
                </div>
              )}
            </div>
          )}

          {/* 5.5 利用フロー */}
          {(idea.initial_flow || idea.important_operations) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-600" />
                利用フロー
              </h2>
              
              {idea.initial_flow && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">初回利用時の流れ</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.initial_flow}</p>
                </div>
              )}

              {idea.important_operations && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">最も重要な操作の手順</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.important_operations}</p>
                </div>
              )}
            </div>
          )}

          {/* 6. 収益モデル */}
          {(idea.monetization_method || idea.price_range || idea.free_paid_boundary) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                収益モデル
              </h2>
              
              {idea.monetization_method && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">マネタイズ方法</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.monetization_method}</p>
                </div>
              )}

              {idea.price_range && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">想定価格帯</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.price_range}</p>
                </div>
              )}

              {idea.free_paid_boundary && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">無料/有料の境界線</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.free_paid_boundary}</p>
                </div>
              )}
            </div>
          )}

          {/* 7. 参考イメージ */}
          {(idea.similar_services || idea.design_atmosphere || idea.reference_urls) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Palette className="w-6 h-6 text-pink-600" />
                参考イメージ
              </h2>
              
              {idea.similar_services && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">似ているサービス・アプリ</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.similar_services}</p>
                </div>
              )}

              {idea.design_atmosphere && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">デザインの雰囲気</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.design_atmosphere}</p>
                </div>
              )}

              {idea.reference_urls && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">参考URL</h3>
                  <div className="space-y-2">
                    {idea.reference_urls.split('\n').filter((url: string) => url.trim()).map((url: string, index: number) => (
                      <a
                        key={index}
                        href={url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {url.trim()}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 8. その他 */}
          {(idea.expected_release || idea.priority_points) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-gray-600" />
                その他
              </h2>
              
              {idea.expected_release && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">想定リリース時期</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.expected_release}</p>
                </div>
              )}

              {idea.priority_points && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">特に重視したいポイント</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.priority_points}</p>
                </div>
              )}
            </div>
          )}

          {/* 9. 技術的な希望 */}
          {(idea.device_type || idea.external_services) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-indigo-600" />
                技術的な希望
              </h2>
              
              {idea.device_type && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">使用デバイス</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.device_type}</p>
                </div>
              )}

              {idea.external_services && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">必要な外部サービス</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.external_services}</p>
                </div>
              )}
            </div>
          )}

          {/* 10. 成功イメージ */}
          {(idea.one_month_goal || idea.success_metrics) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-teal-600" />
                成功イメージ
              </h2>
              
              {idea.one_month_goal && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">リリース後1ヶ月の理想的な状態</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.one_month_goal}</p>
                </div>
              )}

              {idea.success_metrics && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">数値目標</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{idea.success_metrics}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // 従来のシンプルフォーマット表示
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-gray-900">解決したい問題</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {idea.problem}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-semibold text-gray-900">解決策・アイデア</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {idea.solution}
                </p>
              </div>

              {idea.target_users && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">ターゲットユーザー</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {idea.target_users}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {idea.tags && idea.tags.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">タグ</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.map((tag: string, index: number) => (
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

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">このアイデアの統計</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">「ほしい！」の数</span>
                    <span className="font-medium">{wantsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">コメント数</span>
                    <span className="font-medium">{comments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">投稿日</span>
                    <span className="font-medium">{formatDate(idea.created_at)}</span>
                  </div>
                  {idea.updated_at !== idea.created_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">最終更新</span>
                      <span className="font-medium">{formatDate(idea.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 完成アプリ情報 */}
      {idea.completed_apps && idea.completed_apps.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm p-8 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-green-900">このアイデアから生まれたアプリ</h2>
          </div>
          
          <div className="space-y-4">
            {idea.completed_apps.map((app: any) => {
              const avgRating = app.reviews?.length > 0
                ? app.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / app.reviews.length
                : 0
              
              return (
                <div key={app.id} className="bg-white rounded-lg p-6 border border-green-100">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{app.app_name}</h3>
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-medium">{avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  {app.description && (
                    <p className="text-gray-600 mb-4">{app.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Code className="w-4 h-4" />
                      <span>開発: EmBldチーム</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/apps/${app.id}`}
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium"
                      >
                        詳細を見る
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      
                      {app.app_url && (
                        <a
                          href={app.app_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          アプリを使う
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 開発準備中メッセージ */}
      {(!idea.completed_apps || idea.completed_apps.length === 0) && (
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-8 border-2 border-dashed border-primary-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              開発準備中
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              このアイデアは現在EmBldチームが開発を検討しています。
              「ほしい！」やコメントで応援していただくと、開発優先度が上がります。
            </p>
          </div>
        </div>
      )}

      {/* コメントセクション */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <CommentSection
          ideaId={idea.id}
          initialComments={comments}
        />
      </div>
    </div>
  )
}