import { createSupabaseServerClient } from '@/lib/supabase/server'
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
  Link as LinkIcon,
  MessageCircle
} from 'lucide-react'
import { CoreFeature } from '@/types'

export default async function IdeaDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Debug logging for server component
  console.log('IdeaDetailPage: Starting data fetch for ID:', params.id)
  console.log('IdeaDetailPage: Session available:', !!session)
  console.log('IdeaDetailPage: User ID:', session?.user?.id)

  // First try to get just the basic idea data
  const { data: idea, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !idea) {
    console.error('IdeaDetailPage: Basic query failed:', error)
    notFound()
  }

  // Then get related data separately
  const [userResult, wantsResult, commentsResult, appsResult] = await Promise.all([
    supabase.from('users').select('username, avatar_url, google_avatar_url').eq('id', idea.user_id).single(),
    supabase.from('wants').select('user_id').eq('idea_id', idea.id),
    supabase.from('comments').select(`
      *,
      user:users(username, avatar_url, google_avatar_url),
      comment_likes(user_id)
    `).eq('idea_id', idea.id).order('created_at', { ascending: false }),
    supabase.from('completed_apps').select(`
      *,
      developer:users(username, avatar_url, google_avatar_url),
      reviews(rating)
    `).eq('idea_id', idea.id)
  ])

  // Combine the data
  const ideaWithRelations = {
    ...idea,
    user: userResult.data,
    wants: wantsResult.data || [],
    comments: commentsResult.data || [],
    completed_apps: appsResult.data || []
  }

  console.log('IdeaDetailPage: Final idea data assembled')

  const wantsCount = ideaWithRelations.wants?.length || 0
  const userHasWanted = session ? ideaWithRelations.wants?.some((want: any) => want.user_id === session.user.id) || false : false
  
  // コメントにいいね情報を追加
  const comments = (ideaWithRelations.comments || []).map((comment: any) => ({
    ...comment,
    user_has_liked: session ? comment.comment_likes?.some((like: any) => like.user_id === session.user.id) || false : false
  }))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isOwner = session?.user?.id === ideaWithRelations.user_id

  // 企画書フォーマットの項目が入力されているかチェック
  const hasProjectPlan = ideaWithRelations.service_name || ideaWithRelations.catch_copy || ideaWithRelations.service_description ||
    ideaWithRelations.background_problem || ideaWithRelations.main_target || ideaWithRelations.value_proposition ||
    ideaWithRelations.core_features?.length > 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
            href={`/ideas/${ideaWithRelations.id}/edit`}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            編集
          </Link>
        )}
      </div>

      {/* プロジェクト名（上部） */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            {ideaWithRelations.category}
          </span>
          <span className={`inline-block px-3 py-1 text-sm rounded-full ${
            ideaWithRelations.status === 'open' ? 'bg-green-100 text-green-700' :
            ideaWithRelations.status === 'in_development' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {ideaWithRelations.status === 'open' ? '募集中' :
             ideaWithRelations.status === 'in_development' ? '開発中' : '完成'}
          </span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {ideaWithRelations.service_name || ideaWithRelations.title}
        </h1>

        {ideaWithRelations.catch_copy && (
          <p className="text-xl text-gray-600 italic mb-6">
            &ldquo;{ideaWithRelations.catch_copy}&rdquo;
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{ideaWithRelations.user.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(ideaWithRelations.created_at)}</span>
            </div>
            {ideaWithRelations.revenue && ideaWithRelations.revenue > 0 && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>{ideaWithRelations.revenue}円</span>
              </div>
            )}
          </div>

          <WantButton
            ideaId={ideaWithRelations.id}
            initialWanted={userHasWanted}
            initialCount={wantsCount}
            className="text-base px-6 py-3"
          />
        </div>
      </div>

      {/* 収益性と参加メンバー */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側：収益性について */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            収益性
          </h2>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">累計収益</span>
                <span className="text-lg font-bold text-green-600">{ideaWithRelations.revenue}円</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: `${Math.min((ideaWithRelations.revenue || 0) / 100000000 * 100, 100)}%`}}></div>
              </div>
            </div>
            
            {ideaWithRelations.monetization_method && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">マネタイズ方法</h3>
                <p className="text-gray-600 text-sm">{ideaWithRelations.monetization_method}</p>
              </div>
            )}
            
            {ideaWithRelations.price_range && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">想定価格帯</h3>
                <p className="text-gray-600 text-sm">{ideaWithRelations.price_range}</p>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">「ほしい！」の数</span>
                <span className="font-medium">{wantsCount}人</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">コメント数</span>
                <span className="font-medium">{comments.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：参加メンバー */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            参加メンバー
          </h2>
          <div className="space-y-4">
            {/* プロジェクトオーナー */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{ideaWithRelations.user.username}</div>
                <div className="text-sm text-blue-600">プロジェクトオーナー</div>
              </div>
            </div>
            
            {/* 開発チーム */}
            {ideaWithRelations.completed_apps && ideaWithRelations.completed_apps.length > 0 ? (
              ideaWithRelations.completed_apps.map((app: any) => (
                <div key={app.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Code className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">EmBldチーム</div>
                    <div className="text-sm text-green-600">開発担当</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">開発メンバー募集中</p>
                <p className="text-xs mt-1">このプロジェクトに参加しませんか？</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 企画書セクション */}
      {hasProjectPlan ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            企画書
          </h2>
          <div className="space-y-8">
          {/* 1. サービス概要 */}
          {(ideaWithRelations.service_description || ideaWithRelations.tags?.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-600" />
                サービス概要
              </h2>
              
              {ideaWithRelations.service_description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">サービスの説明</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.service_description}</p>
                </div>
              )}

              {ideaWithRelations.tags && ideaWithRelations.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">タグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {ideaWithRelations.tags.map((tag: string, index: number) => (
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
          {(ideaWithRelations.background_problem || ideaWithRelations.current_solution_problems || ideaWithRelations.problem) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                背景・課題
              </h2>
              
              {(ideaWithRelations.background_problem || ideaWithRelations.problem) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">解決したい問題</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {ideaWithRelations.background_problem || ideaWithRelations.problem}
                  </p>
                </div>
              )}

              {ideaWithRelations.current_solution_problems && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">現状の解決方法とその問題点</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.current_solution_problems}</p>
                </div>
              )}
            </div>
          )}

          {/* 3. ターゲットユーザー */}
          {(ideaWithRelations.main_target || ideaWithRelations.usage_scene || ideaWithRelations.target_users) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                ターゲットユーザー
              </h2>
              
              {(ideaWithRelations.main_target || ideaWithRelations.target_users) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">メインターゲット</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {ideaWithRelations.main_target || ideaWithRelations.target_users}
                  </p>
                </div>
              )}

              {ideaWithRelations.usage_scene && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">想定利用シーン</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.usage_scene}</p>
                </div>
              )}
            </div>
          )}

          {/* 4. 提供価値 */}
          {(ideaWithRelations.value_proposition || ideaWithRelations.differentiators || ideaWithRelations.solution) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                提供価値
              </h2>
              
              {(ideaWithRelations.value_proposition || ideaWithRelations.solution) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">このサービスで実現したいこと</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {ideaWithRelations.value_proposition || ideaWithRelations.solution}
                  </p>
                </div>
              )}

              {ideaWithRelations.differentiators && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">既存サービスとの違い</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.differentiators}</p>
                </div>
              )}
            </div>
          )}

          {/* 5. 主要機能 */}
          {(ideaWithRelations.core_features?.length > 0 || ideaWithRelations.nice_to_have_features) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-600" />
                主要機能
              </h2>
              
              {ideaWithRelations.core_features && ideaWithRelations.core_features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-4">核となる機能</h3>
                  <div className="space-y-4">
                    {(ideaWithRelations.core_features as CoreFeature[]).map((feature, index) => (
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

              {ideaWithRelations.nice_to_have_features && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">あったらいいなと思う機能</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.nice_to_have_features}</p>
                </div>
              )}
            </div>
          )}

          {/* 5.5 利用フロー */}
          {(ideaWithRelations.initial_flow || ideaWithRelations.important_operations) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-600" />
                利用フロー
              </h2>
              
              {ideaWithRelations.initial_flow && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">初回利用時の流れ</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.initial_flow}</p>
                </div>
              )}

              {ideaWithRelations.important_operations && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">最も重要な操作の手順</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.important_operations}</p>
                </div>
              )}
            </div>
          )}

          {/* 6. 収益モデル */}
          {(ideaWithRelations.monetization_method || ideaWithRelations.price_range || ideaWithRelations.free_paid_boundary) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                収益モデル
              </h2>
              
              {ideaWithRelations.monetization_method && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">マネタイズ方法</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.monetization_method}</p>
                </div>
              )}

              {ideaWithRelations.price_range && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">想定価格帯</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.price_range}</p>
                </div>
              )}

              {ideaWithRelations.free_paid_boundary && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">無料/有料の境界線</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.free_paid_boundary}</p>
                </div>
              )}
            </div>
          )}

          {/* 7. 参考イメージ */}
          {(ideaWithRelations.similar_services || ideaWithRelations.design_atmosphere || ideaWithRelations.reference_urls) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Palette className="w-6 h-6 text-pink-600" />
                参考イメージ
              </h2>
              
              {ideaWithRelations.similar_services && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">似ているサービス・アプリ</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.similar_services}</p>
                </div>
              )}

              {ideaWithRelations.design_atmosphere && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">デザインの雰囲気</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.design_atmosphere}</p>
                </div>
              )}

              {ideaWithRelations.reference_urls && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">参考URL</h3>
                  <div className="space-y-2">
                    {ideaWithRelations.reference_urls.split('\n').filter((url: string) => url.trim()).map((url: string, index: number) => (
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
          {(ideaWithRelations.expected_release || ideaWithRelations.priority_points) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-gray-600" />
                その他
              </h2>
              
              {ideaWithRelations.expected_release && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">想定リリース時期</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.expected_release}</p>
                </div>
              )}

              {ideaWithRelations.priority_points && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">特に重視したいポイント</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.priority_points}</p>
                </div>
              )}
            </div>
          )}

          {/* 9. 技術的な希望 */}
          {(ideaWithRelations.device_type || ideaWithRelations.external_services) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-indigo-600" />
                技術的な希望
              </h2>
              
              {ideaWithRelations.device_type && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">使用デバイス</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.device_type}</p>
                </div>
              )}

              {ideaWithRelations.external_services && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">必要な外部サービス</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.external_services}</p>
                </div>
              )}
            </div>
          )}

          {/* 10. 成功イメージ */}
          {(ideaWithRelations.one_month_goal || ideaWithRelations.success_metrics) && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-teal-600" />
                成功イメージ
              </h2>
              
              {ideaWithRelations.one_month_goal && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">リリース後1ヶ月の理想的な状態</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.one_month_goal}</p>
                </div>
              )}

              {ideaWithRelations.success_metrics && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">数値目標</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{ideaWithRelations.success_metrics}</p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            企画書
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">解決したい問題</h3>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {ideaWithRelations.problem}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">解決策・アイデア</h3>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {ideaWithRelations.solution}
                </p>
              </div>

              {ideaWithRelations.target_users && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">ターゲットユーザー</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {ideaWithRelations.target_users}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {ideaWithRelations.tags && ideaWithRelations.tags.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">タグ</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ideaWithRelations.tags.map((tag: string, index: number) => (
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
          </div>
        </div>
      )}


      {/* 完成アプリ情報 */}
      {ideaWithRelations.completed_apps && ideaWithRelations.completed_apps.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm p-8 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-green-900">このアイデアから生まれたアプリ</h2>
          </div>
          
          <div className="space-y-4">
            {ideaWithRelations.completed_apps.map((app: any) => {
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
      {(!ideaWithRelations.completed_apps || ideaWithRelations.completed_apps.length === 0) && (
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-purple-600" />
          コメント
        </h2>
        <CommentSection
          ideaId={ideaWithRelations.id}
          initialComments={comments}
        />
      </div>
    </div>
  )
}