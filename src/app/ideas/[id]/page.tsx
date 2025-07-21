import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { WantButton } from '@/components/common/WantButton'
import { CommentSection } from '@/components/common/CommentSection'
import { SubmitAppButton } from '@/components/apps/SubmitAppButton'
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
  Code
} from 'lucide-react'

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

  const isOwner = session?.user.id === idea.user_id

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/"
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
            {idea.title}
          </h1>

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
              <SubmitAppButton
                ideaId={idea.id}
                ideaTitle={idea.title}
                isAuthenticated={!!session}
                variant="secondary"
              />
            </div>
          </div>
        </div>

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

            {idea.completed_apps && idea.completed_apps.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 space-y-4 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">このアイデアから生まれたアプリ</h3>
                </div>
                {idea.completed_apps.map((app: any) => {
                  const avgRating = app.reviews?.length > 0
                    ? app.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / app.reviews.length
                    : 0
                  
                  return (
                    <div key={app.id} className="bg-white rounded-lg p-4 space-y-3 border border-green-100">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900">{app.app_name}</h4>
                        {avgRating > 0 && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      {app.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{app.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Code className="w-4 h-4" />
                          <span>開発者: {app.developer?.username || '不明'}</span>
                        </div>
                        
                        <Link
                          href={`/apps/${app.id}`}
                          className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          詳細を見る
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      
                      {app.app_url && (
                        <a
                          href={app.app_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 w-full justify-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          アプリを使ってみる
                        </a>
                      )}
                    </div>
                  )
                })}
                
                {/* Additional App Submission for existing apps */}
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-primary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        別の実装も投稿できます
                      </h4>
                      <p className="text-sm text-gray-600">
                        同じアイデアでも異なるアプローチの実装があれば、ぜひ投稿してください
                      </p>
                    </div>
                    <SubmitAppButton
                      ideaId={idea.id}
                      ideaTitle={idea.title}
                      isAuthenticated={!!session}
                      variant="secondary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Submission Call-to-Action */}
        {(!idea.completed_apps || idea.completed_apps.length === 0) && (
          <div className="mt-8 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-8 border-2 border-dashed border-primary-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                このアイデアを実装してみませんか？
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                素晴らしいアイデアです！開発者の皆さん、ぜひこのアイデアを形にして、多くの人に価値を提供してください。
                完成したアプリは下のボタンから投稿できます。
              </p>
              <SubmitAppButton
                ideaId={idea.id}
                ideaTitle={idea.title}
                isAuthenticated={!!session}
                variant="primary"
                className="text-lg px-8 py-4"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <CommentSection
          ideaId={idea.id}
          initialComments={comments}
        />
      </div>
    </div>
  )
}